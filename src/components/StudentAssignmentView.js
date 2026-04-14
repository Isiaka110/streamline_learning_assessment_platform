import React, { useState, useEffect, useCallback } from 'react';
import SubmissionFormModal from './SubmissionFormModal'; 
import SubmissionViewerModal from './SubmissionViewerModal'; 

const StudentAssignmentView = ({ courseId, studentId }) => {
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
    const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissionToView, setSubmissionToView] = useState(null);

    const fetchAssignmentsWithSubmissions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/student/assignments?courseId=${courseId}`); 
            const data = await res.json();
            
            if (res.ok) {
                setAssignments(data.assignments);
            } else {
                setError(data.message || 'Failed to load assignments.');
            }
        } catch (err) {
            console.error('Fetch Student Assignments Error:', err);
            setError('Could not connect. Please check your internet.');
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        if (courseId && studentId) {
            fetchAssignmentsWithSubmissions();
        }
    }, [fetchAssignmentsWithSubmissions, courseId, studentId]);

    const handleSubmissionClick = (assignment) => {
        setSelectedAssignment(assignment);
        setIsSubmissionModalOpen(true);
    };

    const handleSubmissionSuccess = () => {
        setIsSubmissionModalOpen(false);
        setSelectedAssignment(null);
        fetchAssignmentsWithSubmissions(); 
    };
    
    const handleViewSubmissionClick = (submission) => {
        setSubmissionToView(submission);
        setIsViewerModalOpen(true);
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4 animate-pulse">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-secondary text-xs">Loading assignments...</p>
        </div>
    );

    if (error) return (
        <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-red-600 flex flex-col items-center gap-2">
            <p className="font-bold">Something went wrong</p>
            <p className="text-xs opacity-80">{error}</p>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-foreground tracking-tight">Current Assignments</h3>
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">{assignments.length} tasks recorded</p>
                </div>
            </div>

            {assignments.length === 0 ? (
                <div className="py-20 text-center bg-gray-50 border-2 border-dashed border-gray-100 rounded-[2rem]">
                    <p className="text-lg font-bold text-gray-400">No assignments yet</p>
                    <p className="text-xs text-secondary mt-1">Check back later for updates from your teacher.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {assignments.map((assignment) => {
                        const submission = assignment.submissions[0]; 
                        const isSubmitted = !!submission;
                        const isGraded = isSubmitted && submission.grade !== null && submission.grade !== undefined;
                        const dueDate = new Date(assignment.dueDate);
                        const isPastDue = new Date() > dueDate;

                        let showUpdateButton = isSubmitted ? !isGraded : true;
                        
                        return (
                            <div key={assignment.id} className="group bg-white rounded-[2rem] border border-border flex flex-col lg:flex-row shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                                <div className="flex-1 p-8 space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isPastDue && !isSubmitted ? 'bg-red-50 text-red-600 border-red-100' : 'bg-primary/5 text-primary border-primary/10'}`}>
                                                Due: {dueDate.toLocaleDateString()} at {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {isSubmitted && (
                                                <span className="px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded-full text-[10px] font-bold uppercase tracking-wider">Submitted</span>
                                            )}
                                        </div>
                                        <h4 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{assignment.title}</h4>
                                    </div>
                                    
                                    <div className="p-4 bg-gray-50 rounded-2xl">
                                        <p className="text-secondary text-sm font-semibold leading-relaxed line-clamp-3 italic">
                                            {assignment.description || "No specific instructions provided."}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 pt-2">
                                        <div className="px-4 py-2 bg-gray-100 rounded-full text-[10px] font-bold text-secondary uppercase">Max Score: {assignment.maxPoints}</div>
                                    </div>
                                </div>

                                <div className="lg:w-80 bg-gray-50 p-8 border-l border-border flex flex-col justify-between gap-6">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Grading Status</p>
                                        <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] font-bold text-secondary uppercase">Final Grade</span>
                                                {isGraded ? (
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-3xl font-bold text-primary">{submission.grade}</span>
                                                        <span className="text-[10px] font-bold text-secondary">/ {assignment.maxPoints}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm font-bold text-orange-500">{isSubmitted ? 'Waiting for grading' : 'Not submitted'}</span>
                                                )}
                                            </div>
                                            
                                            {isSubmitted && submission.feedback && (
                                                <div className="pt-3 border-t border-gray-50 flex flex-col gap-1">
                                                    <span className="text-[9px] font-bold text-primary uppercase">Teacher's Feedback</span>
                                                    <p className="text-xs text-secondary font-semibold italic">"{submission.feedback}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {showUpdateButton ? (
                                            <button 
                                                onClick={() => handleSubmissionClick(assignment)} 
                                                className="w-full btn-primary py-3 text-xs"
                                            >
                                                {isSubmitted ? 'Update Submission' : 'Submit Assignment'}
                                            </button>
                                        ) : (
                                            <div className="w-full py-3 rounded-xl bg-gray-100 text-gray-400 font-bold uppercase text-[10px] text-center">
                                                Grade Locked
                                            </div>
                                        )}
                                        
                                        {isSubmitted && (submission.filePath || submission.submissionText) && (
                                            <button 
                                                onClick={() => handleViewSubmissionClick(submission)} 
                                                className="w-full text-[10px] font-bold text-primary hover:underline uppercase tracking-widest text-center"
                                            >
                                                View My Work
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StudentAssignmentView;