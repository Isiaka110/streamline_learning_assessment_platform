// :::1::: components/AssignmentFormModal.js
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
            setError("Error: Course ID is missing. Cannot proceed.");
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
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[1000] p-6 animate-in fade-in duration-300" onClick={() => onClose(false)}>
            <div className="bg-white rounded-[40px] w-full max-w-xl overflow-hidden relative shadow-2xl flex flex-col transform transition-all animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                <div className="bg-indigo-600 p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-10 -translate-y-10 blur-3xl"></div>
                    <div className="relative z-10">
                        <h2 className="text-4xl font-black tracking-tight leading-none mb-2">{isEditing ? 'Edit Assignment' : 'New Assignment'}</h2>
                        <p className="text-indigo-100/80 text-sm font-black uppercase tracking-widest">{isEditing ? 'Update assignment details' : 'Create a new assignment'}</p>
                    </div>
                </div>

                <div className="p-10">
                    {error && (
                        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assignment Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Mid-Term Performance Analysis"
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Due Date</label>
                                <input
                                    type="datetime-local"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-bold text-gray-700 appearance-none"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Maximum Points</label>
                                <input
                                    type="number"
                                    value={maxPoints}
                                    onChange={(e) => setMaxPoints(e.target.value)}
                                    placeholder="e.g. 100"
                                    min="1"
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-black text-indigo-600 text-xl"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description (Optional)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Instructions for students..."
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-medium text-gray-700 min-h-[120px] resize-none placeholder:text-gray-300 shadow-inner"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button 
                                type="button" 
                                onClick={() => onClose(false)} 
                                className="flex-1 py-5 px-6 bg-gray-50 text-gray-400 font-black rounded-3xl hover:bg-gray-100 transition-colors uppercase tracking-widest text-[10px] border border-gray-200"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="flex-[2] py-5 px-6 bg-indigo-600 text-white font-black rounded-3xl hover:bg-black shadow-2xl shadow-indigo-100 hover:shadow-black/20 transition-all transform active:scale-95 uppercase tracking-widest text-[10px]"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Synchronizing...
                                    </span>
                                ) : (
                                    isEditing ? 'Save' : 'Create Assignment'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AssignmentFormModal;