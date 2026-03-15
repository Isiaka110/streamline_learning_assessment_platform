// components/SubmissionFormModal.js

import React, { useState, useEffect } from 'react';

const SubmissionFormModal = ({ assignment, studentId, onClose, onSuccess }) => {
    const [textInput, setTextInput] = useState('');
    const [fileInput, setFileInput] = useState(null); 
    const [fileUrl, setFileUrl] = useState(''); 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [existingSubmission, setExistingSubmission] = useState(null);

    useEffect(() => {
        const fetchExistingSubmission = async () => {
            if (!assignment || !studentId) return;

            try {
                const res = await fetch(`/api/student/submissions?assignmentId=${assignment.id}`);
                const data = await res.json();
                if (res.ok && data.submission) {
                    setExistingSubmission(data.submission);
                    setTextInput(data.submission.submissionText || '');
                    setFileUrl(data.submission.filePath || '');
                }
            } catch (err) {
                console.error("Error fetching existing submission:", err);
            }
        };
        fetchExistingSubmission();
    }, [assignment, studentId]);


    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileInput(file);
        setIsLoading(true);
        setError(null);

        try {
            // Simulated upload path
            setFileUrl(`https://example.com/uploads/${assignment.id}-${studentId}-${file.name}`);
        } catch (err) {
            setError('File transmission failure.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!textInput && !fileUrl) {
            setError('Missing required artifact: content or file attachment.');
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/student/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assignmentId: assignment.id,
                    submissionText: textInput,
                    filePath: fileUrl, 
                }),
            });

            if (res.ok) {
                if (onSuccess) { 
                    onSuccess();
                }
            } else {
                const data = await res.json().catch(() => ({}));
                setError(data.message || 'Submission sequence interrupted.');
            }
        } catch (err) {
            setError('Network uplink failure.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4 sm:p-6 transition-all duration-300 animate-in fade-in" onClick={onClose}>
            <div className="bg-white rounded-3xl sm:rounded-[40px] w-full max-w-2xl shadow-2xl relative overflow-hidden transform transition-all animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh] sm:max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="bg-indigo-600 p-6 sm:p-10 text-white relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full translate-x-10 -translate-y-10 blur-2xl sm:blur-3xl"></div>
                    <div className="relative z-10 flex justify-between items-end">
                        <div className="space-y-1 sm:space-y-2">
                            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-none uppercase">
                                {existingSubmission ? 'Re-Sync Work' : 'Hand In Work'}
                            </h2>
                            <p className="text-indigo-100/80 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em]">{assignment.title}</p>
                        </div>
                        <button onClick={onClose} className="p-2 sm:p-4 hover:bg-white/20 rounded-xl sm:rounded-2xl transition-all active:scale-95 group">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>
                
                <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Submission Narrative</label>
                            <textarea
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="Type your strategic response or implementation notes here..."
                                className="w-full min-h-[180px] p-8 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-[32px] outline-none transition-all resize-none shadow-inner font-medium text-gray-700 placeholder:text-gray-300 italic"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Artifact Attachment</label>
                            <div className="bg-indigo-50/30 border-2 border-dashed border-indigo-100 p-10 rounded-[32px] text-center group/file hover:border-indigo-300 transition-all cursor-pointer relative overflow-hidden">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    disabled={isLoading}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl text-indigo-600 group-hover/file:scale-110 transition-transform group-hover/file:bg-indigo-600 group-hover/file:text-white duration-500">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                    </div>
                                    <span className="text-gray-900 font-black uppercase tracking-widest text-[10px] mt-2 italic group-hover/file:text-indigo-600 transition-colors">Bind Files to Directive</span>
                                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-tighter opacity-60">PDF, ZIP, DOCX supported</span>
                                </div>
                            </div>
                            {fileUrl && (
                                <div className="mt-4 flex items-center justify-between gap-4 bg-emerald-50/50 px-6 py-4 rounded-2xl border border-emerald-100 animate-in slide-in-from-top-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest truncate max-w-[200px]">{fileUrl.split('/').pop()}</span>
                                    </div>
                                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-xl shadow-sm hover:bg-emerald-500 hover:text-white transition-all active:scale-90">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="pt-6 flex gap-4 shrink-0">
                            <button 
                                type="button" 
                                onClick={onClose}
                                className="flex-1 py-5 px-6 bg-gray-50 text-gray-400 font-black rounded-3xl hover:bg-gray-100 transition-colors uppercase tracking-widest text-[10px] border border-gray-200"
                                disabled={isLoading}
                            >
                                Not Today
                            </button>
                            <button 
                                type="submit" 
                                className={`flex-[2] py-5 px-6 font-black rounded-3xl shadow-2xl transition-all transform active:scale-95 uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 ${isLoading ? 'bg-gray-200 text-gray-400' : 'bg-indigo-600 text-white hover:bg-black shadow-indigo-100 hover:shadow-black/20'}`}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Transmitting...
                                    </>
                                ) : (
                                    <>
                                        {existingSubmission ? 'Sync Updated Protocol' : 'Finalize Transmission'}
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SubmissionFormModal;