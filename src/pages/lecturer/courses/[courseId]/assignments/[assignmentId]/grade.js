// pages/lecturer/courses/[courseId]/assignments/[assignmentId]/grade.js

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import prisma from '@api/prisma'; // Adjust path as needed
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@api/auth/[...nextauth]';
import { UserRole } from '@prisma/client';

// This is the component that will render on the client-side
const AssignmentGradingPage = ({ initialAssignment, initialSubmissions, initialError }) => {
    const router = useRouter();
    const { courseId, assignmentId } = router.query;

    const [assignment, setAssignment] = useState(initialAssignment);
    const [submissions, setSubmissions] = useState(initialSubmissions);
    const [isLoading, setIsLoading] = useState(!initialAssignment && !initialError); // Only loading if no initial data
    const [error, setError] = useState(initialError);
    const [editingSubmissionId, setEditingSubmissionId] = useState(null);
    const [currentGrade, setCurrentGrade] = useState('');
    const [currentFeedback, setCurrentFeedback] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Fetch data if not provided initially (e.g., direct navigation)
    const fetchGradingData = useCallback(async () => {
        if (!assignmentId || !courseId) return;

        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/lecturer/assignments/${assignmentId}/submissions?courseId=${courseId}`);
            const data = await res.json();
            
            if (res.ok) {
                setAssignment(data.assignment);
                setSubmissions(data.submissions);
            } else {
                setError(data.message || 'Failed to load grading data.');
            }
        } catch (err) {
            console.error('Fetch Grading Data Error:', err);
            setError('Network error while fetching grading data.');
        } finally {
            setIsLoading(false);
        }
    }, [assignmentId, courseId]);

    useEffect(() => {
        if (!initialAssignment && !initialError) {
            fetchGradingData();
        }
    }, [initialAssignment, initialError, fetchGradingData]);

    const handleEditGrade = (submission) => {
        setEditingSubmissionId(submission.id);
        setCurrentGrade(submission.grade !== null ? submission.grade.toString() : '');
        setCurrentFeedback(submission.feedback || '');
    };

    const handleSaveGrade = async (submissionId) => {
        setIsSaving(true);
        setError(null);
        try {
            const res = await fetch(`/api/lecturer/submissions/${submissionId}/grade`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    grade: currentGrade !== '' ? parseInt(currentGrade, 10) : null, // Convert to number or null
                    feedback: currentFeedback || null,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                alert('Grade and feedback saved successfully!');
                setEditingSubmissionId(null); // Exit editing mode
                setCurrentGrade('');
                setCurrentFeedback('');
                fetchGradingData(); // Refresh list to show updated grade
            } else {
                setError(data.message || 'Failed to save grade.');
            }
        } catch (err) {
            console.error('Save Grade Error:', err);
            setError('Network error while saving grade.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingSubmissionId(null);
        setCurrentGrade('');
        setCurrentFeedback('');
    };

    if (isLoading) return <p className="text-center p-4">Loading submissions for grading...</p>;
    if (error) return <p className="text-center p-4 text-red-600">Error: {error}</p>;
    if (!assignment) return <p className="text-center p-4">Assignment not found.</p>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Grade Submissions for: {assignment.title}</h1>
            <button 
                onClick={() => router.back()} 
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mb-6"
            >
                &larr; Back to Assignments
            </button>

            {submissions.length === 0 ? (
                <p className="text-center text-gray-600 text-lg">No submissions yet for this assignment.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {submissions.map((submission) => (
                        <div key={submission.id} className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
                            <h3 className="text-xl font-semibold mb-3">Student: {submission.student.name}</h3>
                            <p className="text-gray-700 text-sm mb-2">Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>
                            
                            {editingSubmissionId === submission.id ? (
                                // Editing mode
                                <div>
                                    <div className="mb-4">
                                        <label htmlFor={`grade-${submission.id}`} className="block text-gray-700 text-sm font-bold mb-2">Grade (Max {assignment.maxPoints}):</label>
                                        <input
                                            type="number"
                                            id={`grade-${submission.id}`}
                                            value={currentGrade}
                                            onChange={(e) => setCurrentGrade(e.target.value)}
                                            min="0"
                                            max={assignment.maxPoints}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor={`feedback-${submission.id}`} className="block text-gray-700 text-sm font-bold mb-2">Feedback:</label>
                                        <textarea
                                            id={`feedback-${submission.id}`}
                                            value={currentFeedback}
                                            onChange={(e) => setCurrentFeedback(e.target.value)}
                                            rows="4"
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleSaveGrade(submission.id)} 
                                            disabled={isSaving}
                                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex-1"
                                        >
                                            {isSaving ? 'Saving...' : 'Save Grade'}
                                        </button>
                                        <button 
                                            onClick={handleCancelEdit} 
                                            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex-1"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Display mode
                                <div>
                                    <p className="text-lg font-bold text-gray-800">
                                        Grade: {submission.grade !== null ? `${submission.grade}/${assignment.maxPoints}` : 'Not Graded'}
                                    </p>
                                    {submission.feedback && <p className="text-sm text-gray-600 mt-2">Feedback: {submission.feedback}</p>}

                                    {/* Display Text Submission */}
                                    {submission.submissionText && (
                                        <div className="mt-4 border border-gray-300 p-3 rounded bg-gray-50">
                                            <h4 className="font-semibold text-gray-800 mb-1">Text Submission:</h4>
                                            <p className="text-gray-700 text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">{submission.submissionText}</p>
                                        </div>
                                    )}

                                    {/* Display File Submission */}
                                    {submission.filePath && (
                                        <div className="mt-4">
                                            <h4 className="font-semibold text-gray-800 mb-1">File Submission:</h4>
                                            {submission.filePath.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                                                <img 
                                                    src={submission.filePath} 
                                                    alt="Submission File" 
                                                    className="max-w-full h-auto rounded shadow mt-2"
                                                />
                                            ) : (
                                                <p className="text-gray-700 text-sm">File type: Document</p>
                                            )}
                                            <a 
                                                href={submission.filePath} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="inline-block bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded mt-2"
                                            >
                                                Open File
                                            </a>
                                        </div>
                                    )}

                                    <button 
                                        onClick={() => handleEditGrade(submission)} 
                                        className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                                    >
                                        Edit Grade
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Server-side props to pre-fetch data for initial load (optional, but good for SEO/performance)
export async function getServerSideProps(context) {
    const session = await getServerSession(context.req, context.res, authOptions);

    if (!session || session.user.role !== UserRole.LECTURER) {
        return {
            redirect: {
                destination: '/auth/signin', // Redirect to sign-in or a 403 page
                permanent: false,
            },
        };
    }

    const lecturerId = session.user.id;
    const { courseId, assignmentId } = context.query;
    let initialAssignment = null;
    let initialSubmissions = [];
    let initialError = null;

    try {
        // Verify lecturer access
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { lecturerId: true }
        });

        if (!course || course.lecturerId !== lecturerId) {
            throw new Error('Access Denied: You are not assigned to this course or assignment.');
        }

        // Fetch assignment details
        initialAssignment = await prisma.assignment.findUnique({
            where: { id: assignmentId, courseId: courseId },
            select: {
                id: true,
                title: true,
                description: true,
                dueDate: true,
                maxPoints: true,
            }
        });

        if (!initialAssignment) {
            throw new Error('Assignment not found.');
        }

        // Fetch all submissions for this assignment, including student names
        initialSubmissions = await prisma.submission.findMany({
            where: { assignmentId: assignmentId },
            include: {
                student: { // Include student details
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
            orderBy: { submittedAt: 'asc' }
        });

    } catch (error) {
        console.error("Server-side Grading Data Fetch Error:", error);
        initialError = error.message;
    }

    return {
        props: {
            initialAssignment: JSON.parse(JSON.stringify(initialAssignment)), // Serialize Dates
            initialSubmissions: JSON.parse(JSON.stringify(initialSubmissions)), // Serialize Dates
            initialError,
        },
    };
}

export default AssignmentGradingPage;