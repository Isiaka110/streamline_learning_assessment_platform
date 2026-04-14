// components/SubmissionViewerModal.js

import React from 'react';

const SubmissionViewerModal = ({ submission, onClose }) => {
    if (!submission) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[1000] p-4" onClick={onClose}>
            <div className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden relative shadow-xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="bg-primary p-8 text-white relative shrink-0 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Review Work</h2>
                        <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">Submitted Assignment Details</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="p-8 overflow-y-auto">
                    {submission.submissionText && (
                        <div className="mb-8 space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">My Notes</span>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 italic">
                                <p className="text-secondary text-sm font-semibold leading-relaxed whitespace-pre-wrap">
                                    "{submission.submissionText}"
                                </p>
                            </div>
                        </div>
                    )}

                    {submission.filePath && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Files</span>
                            </div>
                            
                            <div className="bg-gray-100 rounded-2xl overflow-hidden border border-border">
                                {submission.filePath.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                                    <div className="flex flex-col">
                                        <img 
                                            src={submission.filePath} 
                                            alt="Submitted Preview" 
                                            className="w-full h-auto object-contain max-h-[400px]"
                                        />
                                    </div>
                                ) : (
                                    <div className="p-12 flex flex-col items-center justify-center gap-4 text-secondary">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-border shadow-sm">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                        </div>
                                        <p className="font-bold text-xs uppercase tracking-wider">Document File Attached</p>
                                    </div>
                                )}
                            </div>
                            
                            <a 
                                href={submission.filePath} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="w-full btn-primary py-4 text-xs flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                Download Attached File
                            </a>
                        </div>
                    )}
                    
                    {!submission.submissionText && !submission.filePath && (
                        <div className="py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-secondary font-bold text-sm italic">This submission is empty.</p>
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-border flex justify-end shrink-0">
                    <button 
                        onClick={onClose} 
                        className="btn-outline px-8 py-3 text-xs"
                    >
                        Close Preview
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubmissionViewerModal;