import React, { useState, useEffect, useCallback } from 'react';

function CourseAssignmentGrades({ courseId }) {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAssignmentData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/student/courses/${courseId}/assignments`);
            const data = await response.json();

            if (response.ok) {
                setAssignments(data.assignments || []);
                setError(null);
            } else {
                setError(data.message || 'Failed to load assignment data.');
            }
        } catch (err) {
            console.error("Network error fetching assignments:", err);
            setError('Network error: Could not fetch assignments/grades.');
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        if (courseId) {
            fetchAssignmentData();
        }
    }, [fetchAssignmentData, courseId]);

    const getGradeDisplay = (submission, maxPoints) => {
        if (!submission) return <span className="text-gray-400 font-black italic">NOT SUBMITTED</span>;
        if (submission.grade === null) return <span className="text-amber-500 font-black italic">NOT GRADED</span>;
        return (
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-indigo-600 italic leading-none">{submission.grade}</span>
                <span className="text-[10px] font-black text-gray-300 uppercase">/ {maxPoints}</span>
            </div>
        );
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4 animate-pulse">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-indigo-600 uppercase tracking-widest text-[10px] italic">Loading Grades...</p>
        </div>
    );

    if (error) return (
        <div className="p-10 bg-rose-50 border-2 border-rose-100 rounded-[40px] text-rose-700 flex flex-col items-center gap-4 animate-in fade-in zoom-in-95">
            <p className="font-black text-xs uppercase tracking-widest">Error Loading Data</p>
            <p className="font-bold opacity-70 text-[10px] text-center">{error}</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex justify-between items-end border-b border-gray-100 pb-8">
                <div className="space-y-1">
                    <h4 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Assignment <span className="text-indigo-600 tracking-[0.1em]">List</span></h4>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{assignments.length} Assignments Found</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full border border-indigo-100">
                     <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                     <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Sync Active</span>
                </div>
            </div>

            {assignments.length === 0 ? (
                <div className="py-20 text-center bg-gray-50/50 rounded-[40px] border-4 border-dashed border-gray-100">
                    <p className="text-xl font-black text-gray-300 italic tracking-tight uppercase">No Assignments</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">No assignments have been created for this course yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {assignments.map(assignment => (
                        <div key={assignment.id} className="group bg-white p-8 rounded-[40px] shadow-xl shadow-gray-100 border border-gray-50 transform transition-all hover:scale-[1.01] hover:shadow-indigo-100/50 duration-500 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full translate-x-12 -translate-y-12 blur-3xl group-hover:bg-indigo-200 transition-colors"></div>
                            
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest italic decoration-indigo-200 underline underline-offset-4 decoration-2">ID-{assignment.id.substring(0,4)}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Due Date: {new Date(assignment.dueDate).toLocaleDateString('en-GB')}</span>
                                    </div>
                                    <h5 className="text-2xl font-black text-gray-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors uppercase italic">{assignment.title}</h5>
                                </div>
                                
                                <div className="flex items-center gap-8">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1 italic">Your Grade</span>
                                        {getGradeDisplay(assignment.submission, assignment.maxPoints)}
                                    </div>
                                    <button className="px-8 py-4 bg-gray-900 text-white font-black rounded-[24px] shadow-2xl transition-all transform active:scale-95 uppercase tracking-widest text-[9px] group-hover:bg-indigo-600 hover:shadow-indigo-100">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CourseAssignmentGrades;