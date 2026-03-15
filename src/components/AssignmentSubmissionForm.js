import React, { useState } from 'react';

const AssignmentSubmissionForm = ({ assignmentId, onClose, onSuccess }) => {
    const [submissionText, setSubmissionText] = useState('');
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (!submissionText && !file) {
            setError("Please provide submission text or upload a file.");
            setIsLoading(false);
            return;
        }

        let filePath = null;

        try {
            if (file) {
                filePath = `https://example.com/uploads/${assignmentId}-${Date.now()}-${file.name}`;
            }

            const submissionData = {
                assignmentId,
                submissionText,
                filePath, 
            };

            const res = await fetch('/api/student/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccessMessage(data.message || 'Assignment submitted successfully.');
                if (onSuccess) {
                    onSuccess();
                }
                setTimeout(onClose, 2000); 
            } else {
                setError(data.message || 'Failed to submit assignment.');
            }
        } catch (err) {
            console.error('Submission Error:', err);
            setError('Network error during submission.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-[40px] w-full max-w-xl overflow-hidden relative shadow-2xl flex flex-col transform transition-all animate-in zoom-in-95 duration-300">
            <div className="bg-indigo-600 p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-10 -translate-y-10 blur-3xl"></div>
                <div className="relative z-10 flex justify-between items-end">
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black tracking-tight leading-none uppercase">Submit Assignment</h2>
                        <p className="text-indigo-100/80 text-[10px] font-black uppercase tracking-[0.2em]">Upload your work</p>
                    </div>
                </div>
            </div>

            <div className="p-10">
                {error && (
                    <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                        {error}
                    </div>
                )}
                
                {successMessage && (
                    <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 text-[10px] font-black uppercase tracking-widest text-center animate-in fade-in zoom-in-95">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your Message</label>
                        <textarea
                            value={submissionText}
                            onChange={(e) => setSubmissionText(e.target.value)}
                            placeholder="Provide any additional details or notes about your submission..."
                            className="w-full px-8 py-6 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-[32px] outline-none transition-all font-medium text-gray-700 min-h-[180px] resize-none placeholder:text-gray-300 shadow-inner"
                            disabled={isLoading || !!successMessage}
                        />
                    </div>

                    <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Upload File (Optional)</label>
                        <div className="relative group/file">
                            <input 
                                type="file" 
                                onChange={handleFileChange} 
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-4 file:px-8 file:rounded-2xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition-all cursor-pointer bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-2"
                                disabled={isLoading || !!successMessage} 
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="flex-1 py-5 px-6 bg-gray-50 text-gray-400 font-black rounded-3xl hover:bg-gray-100 transition-colors uppercase tracking-widest text-[10px] border border-gray-200"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isLoading || !!successMessage}
                            className={`flex-[2] py-5 px-6 font-black rounded-3xl shadow-2xl transition-all transform active:scale-95 uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 ${isLoading || !!successMessage ? 'bg-gray-100 text-gray-300' : 'bg-indigo-600 text-white hover:bg-black shadow-indigo-100 hover:shadow-black/20'}`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Submitting...
                                </>
                            ) : successMessage ? (
                                'Submitted'
                            ) : (
                                <>
                                    Submit Assignment
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignmentSubmissionForm;