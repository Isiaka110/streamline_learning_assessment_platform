// :::::::2:::::::: components/AssignmentGradingTool.js
import React, { useState, useEffect, useCallback } from 'react';

// Sub-component for individual submission grading
const GradingForm = ({ submission, maxPoints, onGradeUpdate }) => {
    // Grade defaults to 0 if null, but displayed as existing grade if present
    const [grade, setGrade] = useState(submission.grade != null ? submission.grade : 0); 
    const [feedback, setFeedback] = useState(submission.feedback || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        setGrade(submission.grade != null ? submission.grade : 0);
        setFeedback(submission.feedback || '');
        setMessage('');
    }, [submission]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        
        const numGrade = parseInt(grade);
        if (isNaN(numGrade) || numGrade < 0 || numGrade > maxPoints) {
            setMessage(`Error: Grade must be a number between 0 and ${maxPoints}.`);
            setLoading(false);
            return;
        }

        try {
            // NOTE: API route for grading should be fixed to handle PATCH method
            const response = await fetch(`/api/submissions/${submission.id}/grade`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    grade: numGrade, 
                    feedback: feedback 
                }),
            });

            const contentType = response.headers.get("content-type");
            let data = {};
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.error("Server Non-JSON Response (Grading):", text);
                setMessage(`Server returned non-JSON response (Status: ${response.status}).`);
                setLoading(false);
                return;
            }

            if (response.ok) {
                setMessage(data.message || `Grade saved successfully (${numGrade}/${maxPoints})`);
                // Update parent state with the new submission data
                onGradeUpdate(submission.id, data.submission); 
            } else {
                setMessage(`Error: ${data.message || 'Failed to update grade. Check server logs.'}`);
            }
        } catch (error) {
            setMessage('Network error during grading.');
        } finally {
            setLoading(false);
        }
    };

    // 🔑 Using 'filePath' to match the Prisma schema
    const fileUrl = submission.filePath; 
    const isGraded = submission.grade !== null;

    return (
        <div className={`bg-white rounded-3xl p-6 border-2 transition-all duration-300 hover:shadow-xl ${isGraded ? 'border-emerald-100 shadow-emerald-50/50' : 'border-amber-100 shadow-amber-50/50 blink-border'}`}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${isGraded ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                        {submission.student.name.charAt(0)}
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-gray-900 tracking-tight leading-none">{submission.student.name}</h4>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                            {new Date(submission.submittedAt).toLocaleDateString()} @ {new Date(submission.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                    </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm ${isGraded ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                    {isGraded ? `${submission.grade}/${maxPoints}` : 'Unmarked'}
                </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 relative group overflow-hidden border border-gray-100 italic text-sm text-gray-600 leading-relaxed min-h-[80px]">
                <span className="text-3xl font-serif text-indigo-100 absolute -top-1 -left-1">"</span>
                {submission.submissionText || "No additional text provided."}
                
                {fileUrl ? (
                    <a 
                        href={fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="mt-4 flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all font-bold text-xs shadow-sm shadow-indigo-50/50 group-active:scale-95 text-center"
                    >
                        <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        <span>Download Asset ({fileUrl.split('.').pop().toUpperCase()})</span>
                    </a>
                ) : (
                    <div className="mt-4 flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-tighter">
                        <svg className="w-4 h-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                        Zero Attachments
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assign Score (Max {maxPoints})</label>
                    <input 
                        type="number" 
                        value={grade} 
                        onChange={(e) => setGrade(e.target.value)} 
                        min="0"
                        max={maxPoints}
                        required
                        className="w-full px-4 py-3 bg-white border-2 border-gray-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none rounded-xl transition-all font-black text-indigo-600 text-xl"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lecturer Feedback</label>
                    <textarea 
                        value={feedback} 
                        onChange={(e) => setFeedback(e.target.value)} 
                        rows="3"
                        placeholder="Well done! Consider improving..."
                        className="w-full px-4 py-3 bg-white border-2 border-gray-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none rounded-xl transition-all text-sm font-medium resize-none shadow-inner"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading} 
                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 transform active:scale-95 shadow-xl ${isGraded ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100' : 'bg-indigo-600 text-white hover:bg-black shadow-indigo-100'}`}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Saving...
                        </>
                    ) : (
                        `Finalize Mark (${grade}/${maxPoints})`
                    )}
                </button>
                
                {message && (
                    <div className={`mt-2 p-3 rounded-xl text-center text-[10px] font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-1 ${message.startsWith('Error') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
};


// Main Component
const AssignmentGradingTool = ({ assignmentId, assignmentTitle, onGradingComplete }) => {
    const [submissions, setSubmissions] = useState([]);
    const [maxPoints, setMaxPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSubmissions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/assignments/${assignmentId}/submissions`); 
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})); 
                throw new Error(errorData.message || `Server error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setSubmissions(data.submissions || []);
            setMaxPoints(data.maxPoints || 0); 

        } catch (err) {
            console.error("Fetch Submissions Error:", err);
            setError(`Error: ${err.message || 'Network error fetching submissions.'}`); 
        } finally {
            setLoading(false);
        }
    }, [assignmentId]);

    useEffect(() => {
        if (assignmentId) {
            fetchSubmissions();
        }
    }, [assignmentId, fetchSubmissions]);

    const handleGradeUpdate = (submissionId, updatedSubmission) => {
        setSubmissions(prev => 
            prev.map(sub => (sub.id === submissionId ? updatedSubmission : sub))
        );
    };
    
    if (!assignmentId) return <div className="p-10 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-bold">Select an assignment to begin grading.</div>;
    
    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-indigo-600 font-black uppercase tracking-widest text-xs">Accessing Student Portal...</p>
        </div>
    );
    
    if (error) return (
        <div className="p-6 bg-red-50 border-2 border-red-100 rounded-3xl text-red-700 flex items-center gap-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <div>
                <p className="font-black text-lg text-rose-800">System Obstruction</p>
                <p className="text-sm font-medium opacity-80">{error}</p>
            </div>
        </div>
    );
    
    // Sort submissions: Pending first, then Graded
    const sortedSubmissions = [...submissions].sort((a, b) => {
        if (a.grade === null && b.grade !== null) return -1;
        if (a.grade !== null && b.grade === null) return 1; 
        return new Date(b.submittedAt) - new Date(a.submittedAt);
    });

    const gradedCount = submissions.filter(s => s.grade != null).length;
    const pendingCount = submissions.length - gradedCount;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-50">
                <div className="space-y-2 text-center md:text-left">
                    <p className="text-indigo-600 font-black uppercase tracking-[0.2em] text-[10px]">Lecturer Assessment Module</p>
                    <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">{assignmentTitle}</h2>
                </div>
                
                <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full md:w-auto">
                    <div className="px-2 sm:px-6 py-3 sm:py-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-center min-w-0 md:min-w-[120px]">
                        <p className="text-[8px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total</p>
                        <p className="text-lg sm:text-2xl font-black text-indigo-700 leading-none">{submissions.length}</p>
                    </div>
                    <div className="px-2 sm:px-6 py-3 sm:py-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center min-w-0 md:min-w-[120px]">
                        <p className="text-[8px] sm:text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Graded</p>
                        <p className="text-lg sm:text-2xl font-black text-emerald-700 leading-none">{gradedCount}</p>
                    </div>
                    <div className="px-2 sm:px-6 py-3 sm:py-4 bg-amber-50 border border-amber-100 rounded-2xl text-center min-w-0 md:min-w-[120px]">
                        <p className="text-[8px] sm:text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Pending</p>
                        <p className="text-lg sm:text-2xl font-black text-amber-700 leading-none">{pendingCount}</p>
                    </div>
                </div>
            </div>

            {submissions.length === 0 ? (
                <div className="p-20 text-center bg-gray-50/50 rounded-[40px] border-4 border-dashed border-gray-100 italic text-gray-400 font-bold text-xl">
                    No submissions found for this assignment yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {sortedSubmissions.map(submission => (
                        <GradingForm 
                            key={submission.id}
                            submission={submission}
                            maxPoints={maxPoints}
                            onGradeUpdate={handleGradeUpdate}
                        />
                    ))}
                </div>
            )}
            
            {(gradedCount === submissions.length) && submissions.length > 0 && onGradingComplete && (
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-12 rounded-[40px] text-center text-white shadow-2xl shadow-emerald-200/50 animate-in zoom-in-95 duration-700 mt-20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
                    <div className="relative z-10 space-y-6">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-white/30 animate-bounce shadow-xl">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h3 className="text-4xl font-black tracking-tight">Mission Accomplished!</h3>
                        <p className="text-emerald-50 font-bold max-w-md mx-auto text-lg opacity-90 leading-relaxed">
                            Every participant has been assessed. All grades have been synchronized with the main ledger.
                        </p>
                        <button 
                            onClick={() => onGradingComplete(true)} 
                            className="mt-10 px-10 py-5 bg-white text-emerald-700 font-black rounded-3xl shadow-2xl hover:bg-emerald-50 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto uppercase tracking-widest text-xs"
                        >
                            Return To Hub
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12h18m0 0l-7-7m7 7l-7 7"></path></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignmentGradingTool;