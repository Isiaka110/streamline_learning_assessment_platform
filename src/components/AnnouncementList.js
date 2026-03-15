// components/AnnouncementList.js

import React from 'react';

const AnnouncementList = ({ announcements, isLoading, error }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-32 gap-6 animate-pulse bg-white/5 backdrop-blur-3xl rounded-[40px] border border-white/10">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-black text-indigo-600 uppercase tracking-widest text-[10px] italic">Retrieving Global Intel...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-10 bg-rose-50 border-2 border-rose-100 rounded-[40px] text-rose-700 flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 my-12">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <p className="font-black text-xl uppercase tracking-tighter text-center italic leading-none">Transmission Interrupted</p>
                <p className="font-bold opacity-70 text-[10px] uppercase tracking-widest">{error}</p>
            </div>
        );
    }

    if (announcements.length === 0) {
        return (
            <div className="py-24 text-center bg-white border-4 border-dashed border-gray-100 rounded-[40px] animate-in zoom-in-95">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                </div>
                <p className="text-2xl font-black text-gray-200 italic tracking-tight uppercase">Void Transmission</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">No global announcements found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-1000">
            <div className="flex flex-col gap-2 px-10">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] italic">Priority Communications</span>
                </div>
                <h2 className="text-6xl font-black text-gray-900 tracking-tighter leading-none italic">
                    Platform <span className="text-indigo-600 underline decoration-indigo-50 decoration-8 underline-offset-8">Intel</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {announcements.map((announcement, idx) => (
                    <div 
                        key={announcement.id} 
                        className="group bg-white p-12 rounded-[50px] shadow-2xl shadow-gray-100 border border-gray-50 transform transition-all hover:-translate-y-2 hover:shadow-indigo-100/50 duration-500 relative overflow-hidden"
                        style={{animationDelay: `${idx * 150}ms`}}
                    >
                        <div className="absolute top-0 left-0 w-2 bg-indigo-600 h-full transform -skew-x-12 -translate-x-1 group-hover:w-4 transition-all duration-500"></div>
                        
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                            <div className="space-y-4">
                                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100 italic">Notice-{idx + 101}</span>
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors uppercase italic italic-shadow">
                                    {announcement.title}
                                </h3>
                            </div>
                            <div className="shrink-0 flex flex-col items-end">
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1 italic">Timestamp</span>
                                <span className="text-sm font-black text-gray-900 tabular-nums">
                                    {new Date(announcement.createdAt).toLocaleDateString('en-GB', { 
                                        day: '2-digit', month: 'short', year: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                        
                        <div className="relative">
                            <p className="text-gray-500 font-bold leading-relaxed italic text-lg opacity-80 group-hover:opacity-100 transition-opacity selection:bg-indigo-600 selection:text-white whitespace-pre-wrap">
                                {announcement.content}
                            </p>
                            <div className="mt-10 flex items-center justify-between pt-8 border-t border-gray-50">
                                <div className="flex items-center gap-4 text-[10px] font-black text-gray-300 uppercase italic tracking-widest">
                                    <span>Auth: Command</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                    <span>Secure Channel v.9</span>
                                </div>
                                <svg className="w-6 h-6 text-indigo-50 group-hover:text-indigo-600 transition-colors transform group-hover:scale-125 duration-500" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM16 10a1 1 0 110 2h-1a1 1 0 110-2h1z"/></svg>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center pt-8 opacity-20">
                <div className="flex gap-2">
                    {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>)}
                </div>
            </div>
        </div>
    );
};

export default AnnouncementList;