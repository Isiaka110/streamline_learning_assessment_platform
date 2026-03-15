// components/LecturerSubmissionListView.js

import React, { useState, useEffect, useCallback } from 'react';

const LecturerSubmissionListView = ({ assignment, onClose, onGradeUpdate }) => {
    const [submissions, setSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gradeInput, setGradeInput] = useState({});
    const [feedbackInput, setFeedbackInput] = useState({}); 

    const fetchSubmissions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/lecturer/submissions?assignmentId=${assignment.id}`);
            const data = await res.json();
            
            if (res.ok) {
                setSubmissions(data.submissions);
                const initialGrades = data.submissions.reduce((acc, sub) => {
                    acc[sub.id] = sub.grade !== null ? sub.grade : ''; // Initialize with existing grade or empty
                    return acc;
                }, {});
                setGradeInput(initialGrades);

                const initialFeedback = data.submissions.reduce((acc, sub) => {
                    acc[sub.id] = sub.feedback || '';
                    return acc;
                }, {});
                setFeedbackInput(initialFeedback);
            } else {
                setError(data.message || 'Failed to load submissions.');
            }
        } catch (err) {
            console.error('Fetch Lecturer Submissions Error:', err);
            setError('Network error while fetching submissions.');
        } finally {
            setIsLoading(false);
        }
    }, [assignment.id]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    const handleGradeChange = (submissionId, value) => {
        // Allow empty string for clearing, otherwise parse as integer
        const numValue = value === '' ? '' : parseInt(value, 10);
        if (value !== '' && (isNaN(numValue) || numValue < 0 || numValue > assignment.maxPoints)) {
            // Optionally provide inline feedback instead of just returning
            return; 
        }
        setGradeInput(prev => ({ ...prev, [submissionId]: numValue }));
    };

    const handleFeedbackChange = (submissionId, value) => {
        setFeedbackInput(prev => ({ ...prev, [submissionId]: value }));
    };

    const handleSaveGrade = async (submissionId) => {
        const grade = gradeInput[submissionId];
        const feedback = feedbackInput[submissionId];
        
        // Ensure grade is a number before sending (can be 0)
        if (grade === '' || grade === null || grade === undefined || isNaN(grade)) {
             alert("Please enter a valid grade.");
             return;
        }

        try {
            const res = await fetch('/api/lecturer/grade', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    submissionId,
                    grade: parseInt(grade, 10), // Ensure it's an integer
                    feedback: feedback, 
                }),
            });

            const data = await res.json();

            if (res.ok) {
                alert(`Grade saved for Student ${submissions.find(s => s.id === submissionId)?.student.name}`);
                fetchSubmissions(); // Refresh the list in the modal
                if (onGradeUpdate) onGradeUpdate(); // Notify parent to refresh assignment counts
            } else {
                alert(`Error saving grade: ${data.message}`);
            }
        } catch (err) {
            console.error('Save Grade Error:', err);
            alert('Network error while saving grade.');
        }
    };

    if (isLoading) return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl flex items-center gap-4">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="font-black text-xs uppercase tracking-widest text-indigo-600">Retrieving Vault Data...</span>
            </div>
        </div>
    );

    if (error) return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-rose-100 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Access Denied</h3>
                <p className="text-sm font-medium text-gray-500 mb-6 leading-relaxed">{error}</p>
                <button onClick={onClose} className="w-full py-3 bg-gray-900 text-white font-black rounded-2xl active:scale-95 transition-transform uppercase tracking-widest text-xs">Dismiss</button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-6 z-[1000] animate-in fade-in transition-all duration-300" onClick={onClose}>
            <div className="bg-white rounded-[40px] w-full max-w-[1400px] max-h-[90vh] overflow-hidden relative shadow-2xl flex flex-col transform transition-all animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                {/* Decoration */}
                <div className="h-2 bg-indigo-600 w-full shrink-0" />
                
                <div className="p-10 flex flex-col h-full overflow-hidden">
                    <div className="flex items-start justify-between mb-8 shrink-0">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 italic">Submission Master</span>
                            </div>
                            <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-none">
                                {assignment.title}
                            </h2>
                            <p className="text-gray-400 font-bold mt-2 text-sm">Target Evaluation: <span className="text-indigo-600 font-black">{assignment.maxPoints} Points Max</span></p>
                        </div>
                        <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900 active:scale-90 border border-transparent hover:border-gray-200">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar -mx-10 px-10">
                        {submissions.length === 0 ? (
                            <div className="py-20 text-center flex flex-col items-center gap-4 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200 m-10">
                                <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center text-gray-200">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                                </div>
                                <p className="text-xl font-black text-gray-300 tracking-tight italic">Zero transmissions detected in this channel.</p>
                            </div>
                        ) : (
                            <table className="w-full border-separate border-spacing-y-4">
                                <thead>
                                    <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                        <th className="px-6 py-2">Participant</th>
                                        <th className="px-6 py-2">Transmission Time</th>
                                        <th className="px-6 py-2">Artifacts</th>
                                        <th className="px-6 py-2">Score / {assignment.maxPoints}</th>
                                        <th className="px-6 py-2">Feedback Summary</th>
                                        <th className="px-6 py-2 text-right">Admin Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map(sub => (
                                        <tr key={sub.id} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-5 bg-white border-y border-l border-gray-100 rounded-l-3xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                                                        {sub.student.name.charAt(0)}
                                                    </div>
                                                    <span className="font-black text-gray-900 tracking-tight">{sub.student.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 bg-white border-y border-gray-100">
                                                <div className="text-xs font-bold text-gray-500">
                                                    {new Date(sub.submittedAt).toLocaleDateString()}
                                                </div>
                                                <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-0.5">
                                                    {new Date(sub.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 bg-white border-y border-gray-100 min-w-[300px]">
                                                {sub.filePath && (
                                                    <a href={sub.filePath} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black uppercase tracking-widest mb-2 border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                                        Manifest File
                                                    </a>
                                                )}
                                                {sub.submissionText && (
                                                    <p className="text-xs font-medium text-gray-600 line-clamp-2 italic leading-relaxed">
                                                        "{sub.submissionText}"
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 bg-white border-y border-gray-100">
                                                <input 
                                                    type="number" 
                                                    min="0" 
                                                    max={assignment.maxPoints} 
                                                    value={gradeInput[sub.id]} 
                                                    onChange={(e) => handleGradeChange(sub.id, e.target.value)} 
                                                    className="w-20 px-4 py-2.5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 rounded-xl outline-none transition-all font-black text-indigo-600 text-lg shadow-inner"
                                                />
                                            </td>
                                            <td className="px-6 py-5 bg-white border-y border-gray-100 min-w-[250px]">
                                                <textarea
                                                    value={feedbackInput[sub.id]}
                                                    onChange={(e) => handleFeedbackChange(sub.id, e.target.value)}
                                                    className="w-full min-h-[50px] px-4 py-2.5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 rounded-xl outline-none transition-all text-xs font-medium resize-none shadow-inner py-3"
                                                    placeholder="Input assessment notes..."
                                                />
                                            </td>
                                            <td className="px-6 py-5 bg-white border-y border-r border-gray-100 rounded-r-3xl text-right">
                                                <button 
                                                    onClick={() => handleSaveGrade(sub.id)} 
                                                    className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all transform active:scale-95 shadow-xl ${sub.grade !== null ? 'bg-gray-100 text-gray-500 hover:bg-black hover:text-white' : 'bg-indigo-600 text-white hover:bg-black shadow-indigo-100'}`}
                                                >
                                                    {sub.grade !== null ? 'Refine Mark' : 'Lock Mark'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LecturerSubmissionListView;