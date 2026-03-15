import React, { useState, useEffect, useCallback } from 'react';
import AssignmentTable from './AssignmentTable'; 
import AssignmentFormModal from './AssignmentFormModal'; 
import AssignmentGradingTool from './AssignmentGradingTool'; 

function AssignmentManager({ courseId, courseCode }) {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAssignment, setCurrentAssignment] = useState(null); 
    const [assignmentToGrade, setAssignmentToGrade] = useState(null); 
    

    const fetchAssignments = useCallback(async () => {
        if (!courseId) return;
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`/api/lecturer/assignments?courseId=${courseId}`);
            const data = await response.json();

            if (response.ok) {
                setAssignments(data.assignments || []); 
            } else {
                setError(data.message || 'Failed to load assignments.');
                setAssignments([]);
            }
        } catch (err) {
            console.error("Fetch Assignments Network Error:", err);
            setError('Network error: Could not connect to assignment service.');
            setAssignments([]);
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchAssignments(); 
    }, [fetchAssignments]);
    
    const handleCreateClick = () => { setCurrentAssignment(null); setIsModalOpen(true); };
    const handleEditClick = (assignment) => { setCurrentAssignment(assignment); setIsModalOpen(true); };
    const handleModalClose = (success = false) => {
        setIsModalOpen(false);
        setCurrentAssignment(null);
        if (success) { fetchAssignments(); }
    };
    const handleAssignmentSaveSuccess = (savedAssignment) => {
        setAssignments(prev => {
            const index = prev.findIndex(a => a.id === savedAssignment.id);
            if (index !== -1) {
                return prev.map(a => (a.id === savedAssignment.id ? savedAssignment : a));
            } else {
                return [savedAssignment, ...prev];
            }
        });
        handleModalClose(); 
    };

    const handleGradeClick = (assignment) => { setAssignmentToGrade(assignment); };

    const handleExitGrading = (shouldRefresh = false) => {
        setAssignmentToGrade(null);
        if (shouldRefresh) {
            fetchAssignments(); 
        }
    };

    const handleDelete = async (assignmentId, assignmentTitle) => {
        if (!window.confirm(`Are you sure you want to permanently delete: "${assignmentTitle}"? This cannot be undone.`)) {
            return;
        }

        if (!courseId) {
            alert('Error: Course ID is missing. Cannot perform deletion.');
            return;
        }
        
        try {
            const response = await fetch(`/api/lecturer/assignments?id=${assignmentId}&courseId=${courseId}`, { method: 'DELETE' });
            
            if (response.status === 204) {
                alert(`Assignment "${assignmentTitle}" deleted successfully.`);
                setAssignments(prev => prev.filter(a => a.id !== assignmentId));
            } else {
                const data = await response.json().catch(() => ({}));
                alert(`Error: ${data.message || 'Failed to delete assignment.'}`);
            }
        } catch (e) {
            console.error("Delete Operation Network Error:", e);
            alert('Network error: Could not delete assignment.');
        }
    };


    if (error) return (
        <div className="p-10 bg-rose-50 border-2 border-rose-100 rounded-[40px] text-rose-700 flex flex-col items-center gap-4 animate-in fade-in zoom-in-95">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <p className="font-black text-xl uppercase tracking-tighter">Error</p>
            <p className="font-medium opacity-80">{error}</p>
        </div>
    );
    
    if (loading) return (
        <div className="flex flex-col items-center justify-center p-32 gap-6 animate-pulse">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-indigo-600 uppercase tracking-widest text-xs">Loading assignments...</p>
        </div>
    );

    if (assignmentToGrade) {
        return (
            <div className="animate-in fade-in duration-500">
                <AssignmentGradingTool
                    assignmentId={assignmentToGrade.id}
                    assignmentTitle={assignmentToGrade.title}
                    onGradingComplete={() => handleExitGrading(true)}
                />
            </div>
        );
    }
    
    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 sm:gap-8 bg-white p-6 sm:p-10 rounded-3xl sm:rounded-[40px] shadow-2xl shadow-gray-100 border border-gray-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 sm:w-2 bg-indigo-600 h-full"></div>
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest border border-indigo-100 italic">Assignment Manager</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tighter leading-none">
                        Assignments <span className="text-indigo-600">[{courseCode}]</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[8px] sm:text-[10px]">Course Assignments</p>
                </div>
                
                <button 
                    onClick={handleCreateClick} 
                    className="w-full lg:w-auto px-10 py-4 sm:py-5 bg-indigo-600 text-white font-black rounded-2xl sm:rounded-3xl shadow-2xl shadow-indigo-100 hover:bg-black transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-[8px] sm:text-[10px]"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                    New Assignment
                </button>
            </div>
            
            <AssignmentTable
                assignments={assignments}
                onEdit={handleEditClick}
                onDelete={handleDelete}
                onGrade={handleGradeClick} 
            />

            {isModalOpen && (
                <AssignmentFormModal
                    assignment={currentAssignment} 
                    courseId={courseId}
                    onClose={() => handleModalClose(false)}
                    onSuccess={handleAssignmentSaveSuccess}
                />
            )}
        </div>
    );
}

export default AssignmentManager;