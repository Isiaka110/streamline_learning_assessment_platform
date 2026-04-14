// components/AssignmentManager.js

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
            setError('Could not connect. Please check your internet.');
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
        if (!window.confirm(`Are you sure you want to delete: "${assignmentTitle}"?`)) {
            return;
        }

        if (!courseId) {
            alert('Error: Class ID is missing.');
            return;
        }
        
        try {
            const response = await fetch(`/api/lecturer/assignments?id=${assignmentId}&courseId=${courseId}`, { method: 'DELETE' });
            
            if (response.status === 204) {
                setAssignments(prev => prev.filter(a => a.id !== assignmentId));
            } else {
                const data = await response.json().catch(() => ({}));
                alert(`Error: ${data.message || 'Failed to delete.'}`);
            }
        } catch (e) {
            console.error("Delete Operation Network Error:", e);
            alert('Could not connect. Please check your internet.');
        }
    };


    if (error) return (
        <div className="p-10 bg-red-50 border border-red-100 rounded-3xl text-red-700 flex flex-col items-center gap-4">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <p className="font-bold text-lg">Error</p>
            <p className="text-sm opacity-80">{error}</p>
        </div>
    );
    
    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4 animate-pulse">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-secondary text-sm">Loading assignments...</p>
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
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-3xl shadow-sm border border-border">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Manage Tasks</p>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">
                        Assignments for {courseCode}
                    </h1>
                </div>
                
                <button 
                    onClick={handleCreateClick} 
                    className="btn-primary w-full lg:w-auto"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
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