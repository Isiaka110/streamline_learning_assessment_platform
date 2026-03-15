// components/LecturerCommunication.js
import React, { useState, useEffect, useCallback } from 'react';
import CourseCommentThread from './CourseCommentThread'; // Reusing the established communication component

/**
 * Manages the lecturer's view for student-lecturer private communication threads
 * within a specific course.
 * @param {string} lecturerId - The ID of the currently logged-in lecturer (the sender/recipient).
 * @param {string} courseId - The ID of the currently selected course.
 * @param {string} courseCode - The course code for display purposes.
 */
function LecturerCommunication({ lecturerId, courseId, courseCode }) {
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(true);
    // Initialize selectedStudent to null to ensure the first render is managed
    const [selectedStudent, setSelectedStudent] = useState(null); 
    const [error, setError] = useState(null);

    // 1. Fetch the list of enrolled students for the current course
    const fetchEnrolledStudents = useCallback(async () => {
        if (!courseId) {
            setLoadingStudents(false);
            // It's generally cleaner to return success here if no course is selected
            // and handle the missing course outside this component or in the effect.
            return; 
        }

        setLoadingStudents(true);
        setError(null);
        
        // CRITICAL FIX: The URL must match the API route file structure
        const apiUrl = `/api/lecturer/courses/${courseId}/students`;

        try {
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                // Try to parse JSON error message, fallback to status text
                const contentType = response.headers.get("content-type");
                let errorData = {};
                
                if (contentType && contentType.includes("application/json")) {
                    errorData = await response.json();
                }

                // Throw error with message from server if available
                throw new Error(errorData.message || `Server error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const fetchedStudents = data.students || [];

            setStudents(fetchedStudents);
            
            // Automatically select the first student if available and no student is currently selected
            if (fetchedStudents.length > 0 && !selectedStudent) {
                setSelectedStudent(fetchedStudents[0]);
            } else if (fetchedStudents.length === 0) {
                 setSelectedStudent(null);
            }
            
        } catch (err) {
            console.error("Error fetching students:", err);
            // Provide a more specific error message from the caught error
            setError(`Failed to fetch student list: ${err.message || 'Network issue or server error.'}`);
            setStudents([]);
            setSelectedStudent(null);
        } finally {
            setLoadingStudents(false);
        }
    }, [courseId, selectedStudent]); // Added selectedStudent dependency to maintain current selection after refresh


    useEffect(() => {
        // Trigger fetch only if courseId is present
        if (courseId) {
            fetchEnrolledStudents();
        } else {
            // Reset state if courseId is removed
            setStudents([]);
            setSelectedStudent(null);
            setLoadingStudents(false);
            setError(null);
        }
    }, [courseId, fetchEnrolledStudents]); // Depend on courseId and the memoized function

    const handleStudentSelect = (e) => {
        const studentId = e.target.value;
        const student = students.find(s => s.id === studentId);
        setSelectedStudent(student);
    };

    if (!courseId) return <div className="p-4 bg-blue-50 text-blue-800 border-l-4 border-blue-500 rounded-md">Please select a course to manage communication threads.</div>;
    if (error) return <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm font-medium">Error: {error}</div>;
    if (loadingStudents) return <div className="p-4 text-blue-600 animate-pulse font-medium">Loading student list...</div>;

    return (
        <div className="py-6">
            <h3 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-4 mb-6">
                Direct Communication for {courseCode}
            </h3>

            {students.length === 0 ? (
                <div className="p-5 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-center font-medium">There are no students currently enrolled in this course.</div>
            ) : (
                <>
                    {/* 2. Student Selector Dropdown */}
                    <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <label htmlFor="student-select" className="font-bold text-gray-700 whitespace-nowrap">View Conversation With:</label>
                        <select
                            id="student-select"
                            className="flex-1 w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow bg-white"
                            // Use || '' for controlled component value to handle null/undefined
                            value={selectedStudent?.id || ''} 
                            onChange={handleStudentSelect}
                        >
                             <option value="" disabled>Select a student</option>
                            {students.map(student => (
                                <option key={student.id} value={student.id}>
                                    {student.name} ({student.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 3. Communication Thread */}
                    {selectedStudent ? ( 
                        <div className="border-2 border-indigo-100 rounded-xl overflow-hidden bg-white shadow-sm">
                            <div className="bg-indigo-50/50 p-4 border-b border-indigo-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                                    {selectedStudent.name.charAt(0).toUpperCase()}
                                </div>
                                <h4 className="text-xl font-bold text-indigo-900">
                                    Conversation with {selectedStudent.name}
                                </h4>
                            </div>
                            <div className="p-2">
                                <CourseCommentThread 
                                    courseId={courseId} 
                                    currentUserId={lecturerId} 
                                    otherUserId={selectedStudent.id} 
                                />
                            </div>
                        </div>
                    ) : (
                        // Fallback if the list loaded but no student was selected (shouldn't happen with auto-select, but safe)
                        <div className="p-5 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-center font-medium">Please select a student to view their conversation.</div>
                    )}
                </>
            )}
        </div>
    );
}

export default LecturerCommunication;on;