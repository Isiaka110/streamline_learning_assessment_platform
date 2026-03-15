// components/ResourceList.js

import React from 'react';

const ResourceList = ({ resources, isLoading, error, onEdit, onDelete }) => {
    
    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-32 gap-6 animate-pulse">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-indigo-600 uppercase tracking-widest text-xs">Accessing Resource Inventory...</p>
        </div>
    );

    if (error) return (
        <div className="p-10 bg-rose-50 border-2 border-rose-100 rounded-[40px] text-rose-700 flex flex-col items-center gap-4 animate-in fade-in zoom-in-95">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <p className="font-black text-xl uppercase tracking-tighter">Inventory Access Refused</p>
            <p className="font-medium opacity-80">{error}</p>
        </div>
    );

    if (resources.length === 0) {
        return (
            <div className="py-24 text-center bg-gray-50/50 rounded-[40px] border-4 border-dashed border-gray-100 animate-in zoom-in-95 duration-700">
                <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center text-gray-200 mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                <p className="text-xl font-black text-gray-300 italic tracking-tight">No educational artifacts archived for this sector.</p>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-2 animate-bounce">Awaiting Resource Deployment</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden bg-white/50 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/50 animate-in fade-in duration-700">
            <table className="w-full border-separate border-spacing-0">
                <thead>
                    <tr className="bg-gray-900/5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">
                        <th className="py-6 px-8 rounded-tl-[40px]">Artifact Title</th>
                        <th className="py-6 px-8">Descriptor</th>
                        <th className="py-6 px-8">Data Stream</th>
                        <th className="py-6 px-8">Archived Date</th>
                        <th className="py-6 px-8 text-right rounded-tr-[40px]">Hub Commands</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/50">
                    {resources.map((resource) => (
                        <tr key={resource.id} className="group hover:bg-white transition-all duration-300">
                            <td className="py-8 px-8">
                                <span className="text-xl font-black text-gray-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors uppercase italic underline decoration-indigo-50 decoration-2 underline-offset-4">
                                    {resource.title}
                                </span>
                            </td>
                            <td className="py-8 px-8 max-w-xs">
                                <p className="text-sm font-medium text-gray-500 line-clamp-2 leading-relaxed italic" title={resource.description}>
                                    {resource.description ? `"${resource.description}"` : 'No narrative data provided.'}
                                </p>
                            </td>
                            <td className="py-8 px-8">
                                <a 
                                    href={resource.filePath} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-black transition-colors"
                                >
                                    <div className="p-2 bg-indigo-50 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[120px]">
                                        {resource.filePath.split('/').pop()}
                                    </span>
                                </a>
                            </td>
                            <td className="py-8 px-8">
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-gray-700">
                                        {new Date(resource.uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                    <span className="text-[9px] font-black text-gray-300 uppercase mt-0.5 tracking-tighter italic">Commit Timestamp</span>
                                </div>
                            </td>
                            <td className="py-8 px-8 text-right">
                                <div className="flex gap-3 justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-4">
                                    <button 
                                        onClick={() => onEdit(resource)} 
                                        className="p-3 bg-white border border-gray-100 text-amber-500 hover:bg-amber-500 hover:text-white rounded-2xl shadow-xl shadow-gray-100 hover:shadow-amber-100 transition-all active:scale-90"
                                        title="Recalibrate Artifact"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                    </button>
                                    <button 
                                        onClick={() => onDelete(resource.id, resource.title)} 
                                        className="p-3 bg-white border border-gray-100 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl shadow-xl shadow-gray-100 hover:shadow-rose-100 transition-all active:scale-90"
                                        title="Purge Artifact"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ResourceList;