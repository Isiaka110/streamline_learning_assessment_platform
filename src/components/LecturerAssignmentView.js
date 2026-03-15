import React, { useState, useEffect, useCallback } from 'react';
import AssignmentCreationForm from './AssignmentCreationForm'; 
import { useRouter } from 'next/router';

const LecturerAssignmentView = ({ courseId, lecturerId }) => { 
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCreationFormOpen, setIsCreationFormOpen] = useState(false);
    
    const router = useRouter(); 

    const fetchAssignments = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/lecturer/assignments?courseId=${courseId}`);
            const data = await res.json();
            
            if (res.ok) {
                setAssignments(data.assignments);
            } else {
                setError(data.message || 'Failed to load assignments.');
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
        fetchAssignments(); 
    };

    const handleEditAssignment = (assignmentId) => {
        router.push(`/lecturer/courses/${courseId}/assignments/${assignmentId}/edit`);
    };

    const handleDeleteAssignment = async (assignmentId) => {
        if (!window.confirm("Are you sure you want to delete this assignment?")) {
            return;
        }
        try {
            const res = await fetch(`/api/lecturer/assignments?assignmentId=${assignmentId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                alert('Assignment deleted successfully!');
                fetchAssignments(); 
            } else {
                const errorData = await res.json();
                alert(`Failed to delete assignment: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Delete Assignment Error:', error);
            alert('Failed to delete assignment due to network error.');
        }
    };

    const handleGradeSubmissions = (assignmentId) => {
        router.push(`/lecturer/courses/${courseId}/assignments/${assignmentId}/grade`); 
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-32 gap-6 animate-pulse">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-indigo-600 uppercase tracking-widest text-xs">Accessing Assignment Matrix...</p>
        </div>
    );

    if (error) return (
        <div className="p-10 bg-rose-50 border-2 border-rose-100 rounded-[40px] text-rose-700 flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 max-w-2xl mx-auto my-12">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <p className="font-black text-xl uppercase tracking-tighter text-center">Matrix Disruption</p>
            <p className="font-medium opacity-80 text-center">{error}</p>
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 bg-white p-10 rounded-[40px] shadow-2xl shadow-gray-100 border border-gray-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 bg-indigo-600 h-full"></div>
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 italic">Faculty Control Hub</span>
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">
                        Assignment <span className="text-indigo-600">Protocol</span>
                    </h2>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Managing Course Evaluation Frameworks</p>
                </div>
                
                <button 
                    onClick={handleCreateNewAssignment} 
                    className="px-10 py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl shadow-indigo-100 hover:bg-black transition-all hover:scale-105 active:scale-95 flex items-center gap-3 uppercase tracking-widest text-[10px]"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                    Initialize Directive
                </button>
            </div>

            <div className="overflow-hidden bg-white/50 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/50">
                <table className="w-full border-separate border-spacing-0">
                    <thead>
                        <tr className="bg-gray-900/5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">
                            <th className="py-6 px-10 rounded-tl-[40px]">Strategic Title</th>
                            <th className="py-6 px-10 text-center">Termination Seq</th>
                            <th className="py-6 px-10 text-center">Inbound Artifacts</th>
                            <th className="py-6 px-10 text-center text-rose-500">Pending Review</th>
                            <th className="py-6 px-10 text-right rounded-tr-[40px]">Tactical Commands</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/50">
                        {assignments.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-32 text-center bg-gray-50/10 italic">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center text-gray-200">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                        </div>
                                        <p className="text-xl font-black text-gray-300 italic tracking-tight uppercase">Protocol list is currently void.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            assignments.map((assignment) => (
                                <tr key={assignment.id} className="group hover:bg-white transition-all duration-300">
                                    <td className="py-8 px-10">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xl font-black text-gray-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors italic uppercase decoration-indigo-50 decoration-2 underline-offset-4 underline">
                                                {assignment.title}
                                            </span>
                                            <div className="flex items-center gap-2 mt-2 opacity-60">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Directive Active</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-8 px-10 text-center">
                                        <div className="inline-flex flex-col items-center bg-gray-50 px-4 py-2 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                                            <span className="text-sm font-black text-gray-700 group-hover:text-indigo-700">
                                                {new Date(assignment.dueDate).toLocaleDateString('en-GB')}
                                            </span>
                                            <span className="text-[9px] font-black text-gray-300 uppercase mt-0.5 tracking-tighter">Timeline Cap</span>
                                        </div>
                                    </td>
                                    <td className="py-8 px-10 text-center text-2xl font-black text-gray-900 tabular-nums">
                                        {assignment.submissionsCount}
                                    </td>
                                    <td className="py-8 px-10 text-center">
                                        <span className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl font-black text-xl shadow-inner tabular-nums ${assignment.needsGrading > 0 ? 'bg-rose-50 text-rose-500 animate-pulse' : 'bg-emerald-50 text-emerald-500'}`}>
                                            {assignment.needsGrading}
                                        </span>
                                    </td>
                                    <td className="py-8 px-10 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <button 
                                                onClick={() => handleGradeSubmissions(assignment.id)} 
                                                className="px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-black transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-[9px]"
                                            >
                                                Assess Data
                                            </button>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                                                <button 
                                                    onClick={() => handleEditAssignment(assignment.id)} 
                                                    className="p-3 bg-white border border-gray-100 text-amber-500 hover:bg-amber-500 hover:text-white rounded-2xl shadow-xl shadow-gray-100 hover:shadow-amber-100 transition-all active:scale-90"
                                                    title="Modify Protocol"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteAssignment(assignment.id)} 
                                                    className="p-3 bg-white border border-gray-100 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl shadow-xl shadow-gray-100 hover:shadow-rose-100 transition-all active:scale-90"
                                                    title="Purge Protocol"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isCreationFormOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[1000] p-6 animate-in fade-in duration-300" onClick={() => setIsCreationFormOpen(false)}>
                    <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-indigo-600 p-10 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-20 -translate-y-20 blur-3xl"></div>
                            <h2 className="text-3xl font-black tracking-tight leading-none uppercase relative z-10">New Tactical Directive</h2>
                            <button onClick={() => setIsCreationFormOpen(false)} className="absolute top-10 right-10 p-2 hover:bg-white/20 rounded-xl transition-all active:scale-90 group text-white">
                                <svg className="w-6 h-6 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <AssignmentCreationForm 
                                courseId={courseId} 
                                onSuccess={handleAssignmentCreated} 
                                onClose={() => setIsCreationFormOpen(false)} 
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LecturerAssignmentView;