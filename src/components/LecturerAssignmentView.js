import React, { useState, useEffect, useCallback } from 'react';
// import LecturerSubmissionListView from './LecturerSubmissionListView'; 
import AssignmentCreationForm from './AssignmentCreationForm'; // CRITICAL: Import the new component
import { useRouter } from 'next/router'; // ADD THIS IMPORT
// ... other imports

const LecturerAssignmentView = ({ courseId, lecturerId }) => { 
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCreationFormOpen, setIsCreationFormOpen] = useState(false);
    
    const router = useRouter(); // Initialize router

    const fetchAssignments = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/lecturer/assignments?courseId=${courseId}`);
            const data = await res.json();
            
            if (res.ok) {
                setAssignments(data.assignments);
            } else {
                setError(data.message || 'Failed to load assignments for lecturer.');
            }
        } catch (err) {
            console.error('Fetch Lecturer Assignments Error:', err);
            setError('Network error while fetching assignments.');
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        if (courseId && lecturerId) { 
            fetchAssignments();
        }
    }, [courseId, lecturerId, fetchAssignments]); 

    const handleCreateNewAssignment = () => {
        setIsCreationFormOpen(true);
    };

    const handleAssignmentCreated = () => {
        setIsCreationFormOpen(false);
        fetchAssignments(); // Refresh list after creation
    };

    const handleEditAssignment = (assignmentId) => {
        router.push(`/lecturer/courses/${courseId}/assignments/${assignmentId}/edit`);
    };

    const handleDeleteAssignment = async (assignmentId) => {
        if (!window.confirm("Are you sure you want to delete this assignment? This action cannot be undone.")) {
            return;
        }
        try {
            const res = await fetch(`/api/lecturer/assignments?assignmentId=${assignmentId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                alert('Assignment deleted successfully!');
                fetchAssignments(); // Refresh list
            } else {
                const errorData = await res.json();
                alert(`Failed to delete assignment: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Delete Assignment Error:', error);
            alert('Failed to delete assignment due to network error.');
        }
    };

    // NEW FUNCTION: Handle grading button click
    const handleGradeSubmissions = (assignmentId) => {
        router.push(`/lecturer/courses/${courseId}/assignments/${assignmentId}/grade`); // Redirect to grading page
    };

    if (isLoading) return <p>Loading assignments...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Assignments for: CSC399</h2>
                <button 
                    onClick={handleCreateNewAssignment} 
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                >
                    + Create New Assignment
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Assignment Title
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Due Date
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Submissions
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Needs Grading
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {assignments.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                    No assignments found.
                                </td>
                            </tr>
                        ) : (
                            assignments.map((assignment) => (
                                <tr key={assignment.id}>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        {assignment.title}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        {new Date(assignment.dueDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        {/* Display the calculated submissionsCount */}
                                        {assignment.submissionsCount}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        {/* Display the calculated needsGrading count */}
                                        <span className={assignment.needsGrading > 0 ? "text-red-600 font-bold" : "text-gray-600"}>
                                            {assignment.needsGrading}
                                        </span>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm space-x-2">
                                        <button 
                                            onClick={() => handleEditAssignment(assignment.id)} 
                                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-xs"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteAssignment(assignment.id)} 
                                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-xs"
                                        >
                                            Delete
                                        </button>
                                        <button 
                                            onClick={() => handleGradeSubmissions(assignment.id)} 
                                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-xs"
                                        >
                                            Grade Submissions
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isCreationFormOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-1/2">
                        <AssignmentCreationForm 
                            courseId={courseId} 
                            onSuccess={handleAssignmentCreated} 
                            onClose={() => setIsCreationFormOpen(false)} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default LecturerAssignmentView;