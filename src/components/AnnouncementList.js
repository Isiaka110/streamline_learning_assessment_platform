// components/AnnouncementList.js

import React from 'react';

const AnnouncementList = ({ announcements, isLoading, error }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 animate-pulse">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold text-secondary text-xs uppercase tracking-widest">Fetching updates...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-10 bg-red-50 border border-red-100 rounded-[2rem] text-red-700 flex flex-col items-center gap-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <p className="font-bold text-center italic">{error}</p>
            </div>
        );
    }

    if (announcements.length === 0) {
        return (
            <div className="py-24 text-center bg-gray-50 border-2 border-dashed border-gray-100 rounded-[2rem]">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                </div>
                <p className="text-xl font-bold text-gray-400">No messages found.</p>
                <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Updates will appear here as they are broadcast.</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Institutional Notices</span>
                <h2 className="text-3xl font-bold text-foreground tracking-tight">
                    Recent Announcements
                </h2>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {announcements.map((announcement) => (
                    <div 
                        key={announcement.id} 
                        className="group bg-white p-10 rounded-[2.5rem] shadow-sm border border-border transition-all hover:bg-gray-50 duration-500 relative overflow-hidden"
                    >
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform"></div>
                        
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                            <div className="space-y-1 relative z-10">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest italic">Message from Administration</span>
                                <h3 className="text-2xl font-bold text-foreground">
                                    {announcement.title}
                                </h3>
                            </div>
                            <div className="shrink-0 text-xs font-bold text-secondary uppercase tracking-widest whitespace-nowrap pt-2 italic opacity-60">
                                {new Date(announcement.createdAt).toLocaleDateString(undefined, { 
                                    day: 'numeric', month: 'long', year: 'numeric'
                                })}
                            </div>
                        </div>
                        
                        <div className="pt-6 border-t border-gray-100 relative z-10">
                            <p className="text-secondary leading-relaxed font-semibold italic whitespace-pre-wrap opacity-80">
                                "{announcement.content}"
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AnnouncementList;