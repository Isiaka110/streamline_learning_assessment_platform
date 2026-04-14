// components/AssignmentFormModal.js
import React, { useState, useEffect } from 'react';

function AssignmentFormModal({ assignment, courseId, onClose, onSuccess }) {
    const isEditing = !!assignment; 

    const [title, setTitle] = useState(assignment?.title || '');
    const [description, setDescription] = useState(assignment?.description || '');
    const [maxPoints, setMaxPoints] = useState(assignment?.maxPoints?.toString() || '100'); 
    const [dueDate, setDueDate] = useState(() => {
        if (assignment?.dueDate) {
            const date = new Date(assignment.dueDate);
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); 
            return date.toISOString().slice(0, 16);
        }
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(''); 

    useEffect(() => {
        setError('');
    }, [title, description, maxPoints, dueDate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(''); 

        if (!courseId) {
            setError("Error: Class ID is missing.");
            setIsLoading(false);
            return;
        }

        if (!title.trim() || !dueDate || !maxPoints.trim()) {
            setError("Title, Due Date, and Max Points are required.");
            setIsLoading(false);
            return;
        }
        
        const parsedMaxPoints = parseInt(maxPoints, 10);
        if (isNaN(parsedMaxPoints) || parsedMaxPoints <= 0) {
            setError("Max Points must be a positive number.");
            setIsLoading(false);
            return;
        }

        const assignmentPayload = {
            title: title.trim(),
            description: description.trim(),
            dueDate: new Date(dueDate).toISOString(), 
            maxPoints: parsedMaxPoints,
        };

        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing 
            ? `/api/lecturer/assignments?id=${assignment.id}&courseId=${courseId}` 
            : `/api/lecturer/assignments?courseId=${courseId}`;


        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(assignmentPayload),
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                onSuccess(data.assignment); 
            } else {
                setError(data.message || `Failed to ${isEditing ? 'update' : 'create'} assignment.`);
            }
        } catch (err) {
            console.error('Assignment Form Network Error:', err);
            setError('Network error. Please help by checking your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[1000] p-4 sm:p-6 animate-in fade-in duration-300" onClick={() => onClose(false)}>
            <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden relative shadow-2xl flex flex-col transform transition-all animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                <div className="bg-primary p-8 text-white relative">
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">{isEditing ? 'Edit Assignment' : 'New Assignment'}</h2>
                            <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">{isEditing ? 'Update details' : 'Set a new task for students'}</p>
                        </div>
                        <button onClick={() => onClose(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground ml-1 uppercase tracking-wider">Assignment Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter assignment title"
                                className="w-full px-5 py-3 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-semibold"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-foreground ml-1 uppercase tracking-wider">Due Date</label>
                                <input
                                    type="datetime-local"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full px-5 py-3 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-semibold"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-foreground ml-1 uppercase tracking-wider">Max Points</label>
                                <input
                                    type="number"
                                    value={maxPoints}
                                    onChange={(e) => setMaxPoints(e.target.value)}
                                    placeholder="100"
                                    min="1"
                                    className="w-full px-5 py-3 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-bold text-primary"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground ml-1 uppercase tracking-wider">Instructions (Optional)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What should students do?"
                                className="w-full px-5 py-3 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-semibold min-h-[120px] resize-none"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button 
                                type="button" 
                                onClick={() => onClose(false)} 
                                className="flex-1 btn-outline py-4 text-xs"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="flex-[2] btn-primary py-4 text-xs"
                            >
                                {isLoading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Assignment')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AssignmentFormModal;