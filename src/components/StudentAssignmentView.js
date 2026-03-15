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
            setError('Network error while fetching assignments.');
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
        <div className="flex flex-col items-center justify-center p-32 gap-6 animate-pulse bg-white/5 backdrop-blur-3xl rounded-[40px] border border-white/10 mt-6">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-indigo-600 uppercase tracking-widest text-[10px] italic">Retrieving Tactical Objectives...</p>
        </div>
    );

    if (error) return (
        <div className="p-10 bg-rose-50 border-2 border-rose-100 rounded-[40px] text-rose-700 flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 my-10">
            <p className="font-black text-xl uppercase tracking-tighter text-center italic leading-none">Objective Retrieval Failure</p>
            <p className="font-bold opacity-70 text-[10px] uppercase tracking-widest">{error}</p>
        </div>
    );

    return (
        <div className="mt-8 space-y-12 animate-in fade-in duration-1000">
            <div className="flex items-end justify-between border-b border-gray-100 pb-8 px-4">
                <div className="space-y-1">
                    <h3 className="text-4xl font-black text-gray-900 tracking-tighter leading-none italic uppercase">Strategic <span className="text-indigo-600">Objectives</span></h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">{assignments.length} Tasks Deployed in Sector</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full border border-indigo-100">
                     <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                     <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest italic">Live Assessment Sync</span>
                </div>
            </div>

            {assignments.length === 0 ? (
                <div className="py-24 text-center bg-gray-50 border-4 border-dashed border-gray-100 rounded-[40px] animate-in zoom-in-95 mx-4 italic">
                    <p className="text-2xl font-black text-gray-200 tracking-tight uppercase">Operational Void</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">No directives have been issued for this sector yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-10 px-4">
                    {assignments.map((assignment, idx) => {
                        const submission = assignment.submissions[0]; 
                        const isSubmitted = !!submission;
                        const isGraded = isSubmitted && submission.grade !== null && submission.grade !== undefined;
                        const dueDate = new Date(assignment.dueDate);
                        const isPastDue = new Date() > dueDate;

                        let showUpdateButton = isSubmitted ? !isGraded : true;
                        
                        return (
                            <div key={assignment.id} className="group bg-white rounded-[50px] shadow-2xl shadow-gray-100 border border-gray-50 flex flex-col lg:flex-row gap-8 overflow-hidden transform transition-all hover:-translate-y-2 hover:shadow-indigo-100/50 duration-500 relative" style={{animationDelay: `${idx * 150}ms`}}>
                                {isGraded && (
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 text-emerald-600 flex items-center justify-center rotate-45 translate-x-12 -translate-y-12 border-b-2 border-emerald-500 font-black text-[10px] uppercase tracking-[0.3em] pt-8 z-20">
                                        Validated
                                    </div>
                                )}
                                
                                <div className="flex-1 p-6 sm:p-10 space-y-4 sm:space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                            <span className="px-3 sm:px-4 py-1.5 bg-gray-50 text-gray-400 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest border border-gray-100 italic">Directive ID: {assignment.id.substring(0,6)}</span>
                                            <span className={`px-3 sm:px-4 py-1.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest italic border ${isPastDue && !isSubmitted ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                                Temporal Limit: {dueDate.toLocaleDateString()} @ {dueDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <h4 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors uppercase italic italic-shadow">{assignment.title}</h4>
                                    </div>
                                    
                                    <div className="p-6 sm:p-8 bg-gray-50/50 rounded-3xl sm:rounded-[32px] border border-gray-100">
                                        <p className="text-gray-500 font-bold leading-relaxed text-xs sm:text-sm italic line-clamp-4">{assignment.description || "Operational narrative for this sector is currently classified."}</p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2 sm:pt-4">
                                        <div className="px-4 sm:px-5 py-2 bg-indigo-600 text-white rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] italic">Capacity: {assignment.maxPoints} Pts</div>
                                        {isSubmitted && (
                                            <div className="px-4 sm:px-5 py-2 bg-emerald-500 text-white rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] italic shadow-lg shadow-emerald-100">Transmission Logged</div>
                                        )}
                                    </div>
                                </div>

                                <div className="lg:w-96 bg-gray-900 p-6 sm:p-10 flex flex-col justify-between gap-6 sm:gap-8 relative overflow-hidden">
                                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full translate-x-20 translate-y-20 blur-3xl"></div>
                                    
                                    <div className="space-y-6 relative z-10">
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] italic">Validation Status</span>
                                            <div className="bg-white/5 backdrop-blur-md rounded-[28px] p-6 border border-white/10 flex flex-col gap-4">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic italic-shadow">Final Score</span>
                                                    {isGraded ? (
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-4xl font-black text-emerald-400 italic tabular-nums leading-none italic-shadow">{submission.grade}</span>
                                                            <span className="text-[10px] font-black text-gray-600 uppercase">/ {assignment.maxPoints}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-lg font-black text-amber-500 uppercase italic tracking-tighter italic-shadow">{isSubmitted ? 'Analysis Pending' : 'N/A'}</span>
                                                    )}
                                                </div>
                                                
                                                {isSubmitted && submission.feedback && (
                                                    <div className="pt-4 border-t border-white/5 space-y-2">
                                                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest italic italic-shadow">Evaluative Feedback</span>
                                                        <p className="text-[11px] text-gray-300 font-bold italic leading-relaxed">"{submission.feedback}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 relative z-10">
                                        {showUpdateButton ? (
                                            <button 
                                                onClick={() => handleSubmissionClick(assignment)} 
                                                className={`w-full py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${isSubmitted ? 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10' : 'bg-indigo-600 text-white shadow-indigo-900/40 hover:bg-white hover:text-indigo-600'}`}
                                            >
                                                {isSubmitted ? 'Sync Updated Protocol' : 'Initialize Transmission'}
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                                            </button>
                                        ) : (
                                            <div className="w-full py-5 rounded-[24px] bg-white/5 border border-white/5 text-gray-600 font-black uppercase tracking-widest text-[10px] text-center italic">
                                                Sequence Locked
                                            </div>
                                        )}
                                        
                                        {isSubmitted && (submission.filePath || submission.submissionText) && (
                                            <button 
                                                onClick={() => handleViewSubmissionClick(submission)} 
                                                className="w-full py-2 text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-[0.3em] transition-all italic flex items-center justify-center gap-3"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                Audit My Work
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isSubmissionModalOpen && selectedAssignment && (
                <SubmissionFormModal
                    assignment={selectedAssignment}
                    studentId={studentId}
                    onClose={() => setIsSubmissionModalOpen(false)}
                    onSuccess={handleSubmissionSuccess}
                />
            )}

            {isViewerModalOpen && submissionToView && (
                <SubmissionViewerModal
                    submission={submissionToView}
                    onClose={() => setIsViewerModalOpen(false)}
                />
            )}
            
            <div className="h-20"></div>
        </div>
    );
};

export default StudentAssignmentView;