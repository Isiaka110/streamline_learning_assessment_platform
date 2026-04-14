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
            setError('Could not attach file.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!textInput && !fileUrl) {
            setError('Please provide some text or attach a file.');
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
                setError(data.message || 'Failed to submit your work.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-xl relative overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="bg-primary p-8 text-white relative shrink-0 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {existingSubmission ? 'Update Your Work' : 'Submit Assignment'}
                        </h2>
                        <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">{assignment.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <div className="p-8 overflow-y-auto">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-foreground">Your Message/Notes (Optional)</label>
                            <textarea
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="Type any notes for your teacher here..."
                                className="w-full min-h-[150px] p-4 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm resize-none"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-foreground">Attach File</label>
                            <div className="border-2 border-dashed border-border p-8 rounded-xl text-center hover:border-primary transition-all relative">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    disabled={isLoading}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-3 bg-gray-50 rounded-full text-secondary">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                    </div>
                                    <span className="text-foreground font-bold text-xs uppercase tracking-wider">Choose a file to upload</span>
                                    <span className="text-secondary text-[10px] font-semibold opacity-60">Wait for upload to finish after choosing</span>
                                </div>
                            </div>
                            {fileUrl && (
                                <div className="mt-3 flex items-center justify-between gap-4 bg-green-50 px-4 py-3 rounded-lg border border-green-100 animate-in slide-in-from-top-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest truncate max-w-[150px]">{fileUrl.split('/').pop()}</span>
                                    </div>
                                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline text-[10px] font-bold">View File</a>
                                </div>
                            )}
                        </div>

                        <div className="pt-6 flex gap-4 shrink-0">
                            <button 
                                type="button" 
                                onClick={onClose}
                                className="flex-1 btn-outline py-4"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className={`flex-[2] btn-primary py-4 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Sending...' : (existingSubmission ? 'Update My Work' : 'Submit Now')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SubmissionFormModal;