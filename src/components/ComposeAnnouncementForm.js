import React, { useState } from 'react';

const ComposeAnnouncementForm = ({ onAnnouncementCreated }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const resetForm = () => {
        setTitle('');
        setContent('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setIsError(false);

        if (!title || !content) {
            setMessage('Error: All fields are required.');
            setIsError(true);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/admin/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Success! Announcement broadcasted successfully.');
                setIsError(false);
                resetForm();
                if (onAnnouncementCreated) onAnnouncementCreated(data.announcement);
            } else {
                setMessage(`Failed: ${data.message || 'Error occurred.'}`);
                setIsError(true);
            }
        } catch (error) {
            setMessage('Network Error: Please check your connection.');
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-100 border border-gray-50 overflow-hidden animate-in fade-in slide-in-from-top-12 duration-1000">
            <div className="bg-indigo-600 p-10 text-white relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-10 -translate-y-10 blur-2xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Global Broadcast</span>
                    </div>
                    <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Compose <span className="text-indigo-200">Intel</span></h2>
                </div>
            </div>

            <div className="p-10">
                {message && (
                    <div className={`mb-8 p-5 rounded-2xl border-2 transition-all animate-in zoom-in-95 ${isError ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-center">{message}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 italic">Announcement Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="URGENT: SYSTEM MAINTENANCE"
                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none font-black text-gray-900 placeholder:text-gray-200 uppercase italic shadow-inner transition-all"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 italic">Detailed Broadcast Content</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Enter the critical announcement message details here..."
                            rows="6"
                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none font-medium text-gray-700 italic shadow-inner transition-all resize-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-indigo-600 hover:bg-black text-white font-black rounded-[30px] shadow-lg shadow-indigo-500/30 hover:shadow-black/20 transition-all uppercase tracking-widest italic flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                        {loading ? 'Transmitting...' : (
                            <>
                                Broadcast Announcement
                                <svg className="w-5 h-5 animate-bounce-horizontal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ComposeAnnouncementForm;
