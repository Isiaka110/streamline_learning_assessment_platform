// components/StudentResourceView.js

import React, { useState, useEffect, useCallback } from 'react';

const StudentResourceView = ({ courseId }) => {
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchResources = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/student/resources?courseId=${courseId}`); 
            const data = await res.json();
            
            if (res.ok) {
                setResources(data.resources);
            } else {
                setError(data.message || 'Failed to load course resources.');
            }
        } catch (err) {
            console.error('Fetch Student Resources Error:', err);
            setError('Network error while fetching resources.');
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-32 gap-6 animate-pulse">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-indigo-600 uppercase tracking-widest text-xs">Accessing Knowledge Repository...</p>
        </div>
    );

    if (error) return (
        <div className="p-10 bg-rose-50 border-2 border-rose-100 rounded-[40px] text-rose-700 flex flex-col items-center gap-4 animate-in fade-in zoom-in-95">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <p className="font-black text-xl uppercase tracking-tighter">Repository Failure</p>
            <p className="font-medium opacity-80">{error}</p>
        </div>
    );

    return (
        <div className="mt-12 space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 bg-white p-10 rounded-[40px] shadow-2xl shadow-gray-100 border border-gray-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 bg-indigo-600 h-full"></div>
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 italic">Course Materials Repository</span>
                    </div>
                    <h3 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">
                        Educational <span className="text-indigo-600">Artifacts</span>
                    </h3>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] italic">Strategic Knowledge Assets</p>
                </div>
                <div className="bg-gray-50 px-6 py-4 rounded-3xl border border-gray-100 flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-sm font-black text-gray-700 tabular-nums">{resources.length} Sync'd Assets</span>
                </div>
            </div>

            {resources.length === 0 ? (
                <div className="p-20 text-center bg-gray-50/50 rounded-[40px] border-4 border-dashed border-gray-100 animate-in fade-in zoom-in-95 duration-700">
                    <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center text-gray-200 mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    </div>
                    <p className="text-xl font-black text-gray-300 italic tracking-tight">Repository currently void of data.</p>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-2 animate-bounce">Awaiting Personnel Deployment</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {resources.map((resource) => (
                        <div key={resource.id} className="group bg-white rounded-[40px] p-8 shadow-2xl shadow-gray-100 border border-gray-50 hover:shadow-indigo-100 transition-all duration-500 flex flex-col justify-between hover:-translate-y-2 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full translate-x-16 -translate-y-16 group-hover:bg-indigo-600 transition-colors duration-500 blur-2xl opacity-20 group-hover:opacity-10"></div>
                            
                            <div className="space-y-6 relative z-10">
                                <div className="flex items-start justify-between">
                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-2xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors tracking-tighter leading-tight drop-shadow-sm">{resource.title}</h4>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="w-3 h-3 rounded-md bg-indigo-600/10 flex items-center justify-center">
                                                <div className="w-1 h-1 rounded-full bg-indigo-600"></div>
                                            </div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{new Date(resource.uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 text-gray-400 rounded-[24px] group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-12 transition-all duration-500 shadow-inner group-hover:shadow-indigo-200">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    </div>
                                </div>
                                {resource.description && (
                                    <p className="text-gray-500 text-sm font-medium leading-relaxed italic border-l-2 border-indigo-50 pl-4 py-1">
                                        "{resource.description}"
                                    </p>
                                )}
                            </div>

                            <a 
                                href={resource.filePath} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="mt-10 w-full py-5 bg-gray-900 group-hover:bg-indigo-600 text-white text-center rounded-3xl font-black flex items-center justify-center gap-3 transition-all duration-500 shadow-2xl shadow-gray-200 hover:shadow-indigo-200 active:scale-95 uppercase tracking-widest text-[10px]"
                            >
                                <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                Sync Artifact
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentResourceView;