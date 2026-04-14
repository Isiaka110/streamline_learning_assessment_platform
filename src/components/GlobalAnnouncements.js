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
                setError(data.message || 'Failed to load messages.');
            }
        } catch (err) {
            console.error("Network error fetching announcements:", err);
            setError('Could not connect. Please check your internet.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Institutional Record</span>
                <h3 className="text-3xl font-bold text-foreground tracking-tight">
                    Platform Notices
                </h3>
            </div>
            
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4 bg-gray-50 rounded-[2rem] animate-pulse">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-bold text-secondary text-[10px] uppercase tracking-widest">Fetching history...</p>
                </div>
            ) : error ? (
                <div className="p-8 bg-red-50 border border-red-100 rounded-[2rem] text-red-600 flex flex-col items-center gap-2">
                    <p className="font-bold text-sm italic">{error}</p>
                </div>
            ) : announcements.length === 0 ? (
                <div className="py-20 text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-100">
                    <p className="text-xl font-bold text-gray-400">No history found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {announcements.map((announcement) => (
                        <div key={announcement.id} className="group bg-white p-8 rounded-[2rem] shadow-sm border border-border transition-all hover:bg-gray-50 duration-300">
                            <div className="space-y-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-1">
                                       <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Active Post</span>
                                       <h4 className="text-xl font-bold text-foreground">{announcement.title}</h4>
                                    </div>
                                    <span className="shrink-0 text-[10px] font-bold text-secondary uppercase tracking-widest opacity-60 pt-2 italic">
                                        {new Date(announcement.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                                <div className="pt-4 border-t border-gray-50">
                                    <p className="text-secondary text-sm font-semibold leading-relaxed whitespace-pre-wrap italic opacity-80">
                                        "{announcement.content}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default GlobalAnnouncements;