// components/ComposeAnnouncementForm.js

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
            setMessage('Please fill in all fields.');
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
                setMessage('Successfully posted message!');
                setIsError(false);
                resetForm();
                if (onAnnouncementCreated) onAnnouncementCreated(data.announcement);
            } else {
                setMessage(`Failed: ${data.message || 'Error occurred.'}`);
                setIsError(true);
            }
        } catch (error) {
            setMessage('Could not connect. Please check your internet.');
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
            <div className="bg-primary p-8 text-white relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-10 -translate-y-10 blur-xl"></div>
                <div className="relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">New Update</p>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Post a Message</h2>
                </div>
            </div>

            <div className="p-8">
                {message && (
                    <div className={`mb-6 p-4 rounded-xl text-sm font-semibold border ${isError ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-foreground">Message Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Next week's schedule"
                            className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-foreground">Message Content</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Tell everyone what they need to know..."
                            rows="5"
                            className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm resize-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-4 disabled:opacity-50"
                    >
                        {loading ? 'Posting...' : 'Post Message'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ComposeAnnouncementForm;
