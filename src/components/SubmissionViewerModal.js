// components/SubmissionViewerModal.js

import React from 'react';

const SubmissionViewerModal = ({ submission, onClose }) => {
    if (!submission) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[1000] p-4 sm:p-6 animate-in fade-in duration-300" onClick={onClose}>
            <div className="bg-white rounded-3xl sm:rounded-[40px] w-full max-w-3xl overflow-hidden relative shadow-2xl flex flex-col transform transition-all animate-in zoom-in-95 duration-300 max-h-[95vh] sm:max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="bg-indigo-600 p-6 sm:p-10 text-white relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full translate-x-10 -translate-y-10 blur-2xl sm:blur-3xl"></div>
                    <div className="relative z-10 flex justify-between items-end">
                        <div className="space-y-1 sm:space-y-2">
                            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-none uppercase">Review Artifact</h2>
                            <p className="text-indigo-100/80 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em]">Inbound Submission Analysis</p>
                        </div>
                        <button onClick={onClose} className="p-2 sm:p-4 hover:bg-white/20 rounded-xl sm:rounded-2xl transition-all active:scale-95 group">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar">
                    {submission.submissionText && (
                        <div className="mb-10 space-y-4 animate-in slide-in-from-left-10 duration-500">
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest italic">Text Narrative</span>
                            </div>
                            <div className="p-8 bg-gray-50 border-2 border-dashed border-gray-100 rounded-[32px] shadow-inner">
                                <p className="text-gray-700 font-medium leading-relaxed whitespace-pre-wrap selection:bg-indigo-100 selection:text-indigo-900">
                                    {submission.submissionText}
                                </p>
                            </div>
                        </div>
                    )}

                    {submission.filePath && (
                        <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest italic">Attached Resource</span>
                            </div>
                            
                            <div className="group relative bg-gray-900 rounded-[32px] overflow-hidden shadow-2xl">
                                {submission.filePath.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                                    <div className="flex flex-col">
                                        <img 
                                            src={submission.filePath} 
                                            alt="Submission Artifact" 
                                            className="w-full h-auto object-contain max-h-[500px] transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                                            <p className="text-white text-xs font-black uppercase tracking-widest drop-shadow-md">Visual Data Stream Detected</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-20 flex flex-col items-center justify-center gap-6 bg-gray-900 text-gray-400">
                                        <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white font-black uppercase tracking-widest text-[10px] mb-1">Document Payload</p>
                                            <p className="text-xs font-medium italic opacity-60">Application architecture or research data</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <a 
                                href={submission.filePath} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex w-full items-center justify-center gap-3 py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl shadow-indigo-100 hover:bg-black transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-[10px]"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                Sync Artifact Hub
                            </a>
                        </div>
                    )}
                    
                    {!submission.submissionText && !submission.filePath && (
                        <div className="py-20 text-center bg-rose-50 rounded-[32px] border-2 border-dashed border-rose-100 animate-pulse">
                            <p className="text-rose-600 font-black uppercase tracking-widest text-xs italic">Critical Intelligence Gap: No data payload detected.</p>
                        </div>
                    )}
                </div>

                <div className="p-10 bg-gray-50/50 border-t border-gray-100 shrink-0 text-right">
                    <button 
                        onClick={onClose} 
                        className="px-10 py-4 bg-gray-900 text-white font-black rounded-3xl hover:bg-black transition-colors uppercase tracking-widest text-[10px] shadow-xl shadow-gray-200 active:scale-95"
                    >
                        Back to Command
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubmissionViewerModal;