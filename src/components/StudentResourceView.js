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
                setError(data.message || 'Failed to load class resources.');
            }
        } catch (err) {
            console.error('Fetch Student Resources Error:', err);
            setError('Could not connect. Please check your internet.');
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4 animate-pulse">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-secondary text-xs">Loading class files...</p>
        </div>
    );

    if (error) return (
        <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-red-600 flex flex-col items-center gap-2">
            <p className="font-bold text-sm">Error Loading Files</p>
            <p className="text-xs opacity-80">{error}</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-[2rem] border border-border shadow-sm">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Class Materials</p>
                    <h3 className="text-3xl font-bold text-foreground tracking-tight">
                        Learning Resources
                    </h3>
                </div>
                <div className="bg-gray-50 px-6 py-3 rounded-full border border-gray-100 flex items-center gap-3">
                    <span className="text-sm font-bold text-secondary">{resources.length} files available</span>
                </div>
            </div>

            {resources.length === 0 ? (
                <div className="py-20 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                    <p className="text-lg font-bold text-gray-400">No resources available yet</p>
                    <p className="text-xs text-secondary mt-1">Your teacher hasn't uploaded any files for this class.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map((resource) => (
                        <div key={resource.id} className="group bg-white rounded-[2rem] p-6 border border-border hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">{resource.title}</h4>
                                        <div className="text-[10px] font-bold text-secondary uppercase opacity-60">
                                            Added {new Date(resource.uploadedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50 text-secondary rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    </div>
                                </div>
                                {resource.description && (
                                    <p className="text-secondary text-xs font-semibold italic border-l-2 border-primary/20 pl-4 py-1 line-clamp-2">
                                        "{resource.description}"
                                    </p>
                                )}
                            </div>

                            <a 
                                href={resource.filePath} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="mt-8 w-full py-4 bg-gray-50 hover:bg-primary text-secondary hover:text-white text-center rounded-2xl font-bold text-xs transition-all border border-transparent hover:border-primary flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                Download File
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentResourceView;