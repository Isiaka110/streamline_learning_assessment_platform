// components/GlobalAnnouncements.js

import React, { useState, useEffect, useCallback } from 'react';

function GlobalAnnouncements() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAnnouncements = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/announcements/all');
            const data = await response.json();

            if (response.ok) {
                setAnnouncements(data.announcements || []);
                setError(null);
            } else {
                setError(data.message || 'Failed to load announcements.');
            }
        } catch (err) {
            console.error("Network error fetching announcements:", err);
            setError('Network error: Could not fetch announcements.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] italic">Platform Directive Stream</span>
                </div>
                <h3 className="text-4xl font-black text-gray-900 tracking-tighter leading-none italic uppercase italic-shadow">
                    Global <span className="text-indigo-600">Sync</span>
                </h3>
            </div>
            
            {loading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-6 bg-gray-50/50 rounded-[40px] border-4 border-dashed border-gray-100">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-black text-indigo-400 uppercase tracking-widest text-[9px] italic">Fetching Central Command Intel...</p>
                </div>
            ) : error ? (
                <div className="p-8 bg-rose-50 border-2 border-rose-100 rounded-[32px] text-rose-600 flex flex-col items-center gap-3 animate-shake">
                    <p className="font-black text-[10px] uppercase tracking-widest leading-none">Transmission Error</p>
                    <p className="font-bold opacity-70 text-[10px] uppercase">{error}</p>
                </div>
            ) : announcements.length === 0 ? (
                <div className="py-20 text-center bg-gray-50/50 rounded-[40px] border-4 border-dashed border-gray-100 italic">
                    <p className="text-2xl font-black text-gray-200 tracking-tight uppercase">Manual Void</p>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Directives currently at zero.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {announcements.map((announcement, idx) => (
                        <div key={announcement.id} className="group bg-white p-8 rounded-[40px] shadow-2xl shadow-gray-100 border border-gray-50 transform transition-all hover:scale-[1.01] hover:shadow-indigo-100/50 duration-500 relative overflow-hidden" style={{animationDelay: `${idx * 150}ms`}}>
                            <div className="absolute top-0 right-0 w-2 h-full bg-indigo-600 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-500"></div>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors uppercase italic italic-shadow">{announcement.title}</h4>
                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest tabular-nums italic">
                                        {new Date(announcement.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-500 font-bold leading-relaxed text-sm italic opacity-80 group-hover:opacity-100 transition-opacity">
                                    {announcement.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default GlobalAnnouncements;