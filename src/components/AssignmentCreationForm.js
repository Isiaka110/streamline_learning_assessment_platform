import React, { useState } from 'react';

const AssignmentCreationForm = ({ courseId, onSuccess, onCancel }) => {
    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [maxPoints, setMaxPoints] = useState(100);
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!title.trim() || !dueDate || !maxPoints) {
            setError("Title, Due Date, and Max Points are required.");
            setIsLoading(false);
            return;
        }

        const assignmentData = {
            title,
            dueDate: new Date(dueDate).toISOString(), 
            maxPoints: parseInt(maxPoints, 10), 
            description,
        };

        try {
            const res = await fetch(`/api/lecturer/assignments?courseId=${courseId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(assignmentData),
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                if (onSuccess) onSuccess(data.assignment);
            } else {
                setError(data.message || 'Failed to initialize assignment protocol.');
            }
        } catch (err) {
            console.error('Assignment Creation Error:', err);
            setError('Uplink failure during protocol initialization.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Protocol Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. System Integrity Audit"
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
                        disabled={isLoading}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Termination Matrix (Due Date)</label>
                        <input
                            type="datetime-local"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-bold text-gray-700 appearance-none"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Point Capacity</label>
                        <input
                            type="number"
                            value={maxPoints}
                            onChange={(e) => setMaxPoints(e.target.value)}
                            placeholder="100"
                            min="1"
                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-black text-indigo-600 italic text-xl"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Strategic Narrative</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detailed operational instructions for participants..."
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all min-h-[140px] resize-none font-medium text-gray-700 placeholder:text-gray-300 shadow-inner"
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 shrink-0">
                <button 
                    type="button" 
                    onClick={onCancel} 
                    className="flex-1 py-5 px-6 bg-gray-50 text-gray-400 font-black rounded-3xl hover:bg-gray-100 transition-colors uppercase tracking-widest text-[10px] border border-gray-200"
                    disabled={isLoading}
                >
                    Abort
                </button>
                <button 
                    type="submit" 
                    className={`flex-[2] py-5 px-6 font-black rounded-3xl shadow-2xl transition-all transform active:scale-95 uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 ${isLoading ? 'bg-gray-200 text-gray-400' : 'bg-indigo-600 text-white hover:bg-black shadow-indigo-100 hover:shadow-black/20'}`} 
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Synchronizing...
                        </>
                    ) : (
                        <>
                            Initialize Protocol
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default AssignmentCreationForm;