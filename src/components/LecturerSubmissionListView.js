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

    const styles = {
        overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
        modal: { backgroundColor: 'white', padding: '30px', borderRadius: '8px', maxWidth: '90%', width: '1200px', maxHeight: '90%', overflowY: 'auto', position: 'relative', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' },
        closeButton: { position: 'absolute', top: '10px', right: '20px', fontSize: '1.8em', cursor: 'pointer' },
        table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
        th: { border: '1px solid #ddd', padding: '10px', textAlign: 'left', backgroundColor: '#f3f4f6' },
        td: { border: '1px solid #eee', padding: '10px', verticalAlign: 'top' },
        gradeInput: { width: '60px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' },
        feedbackInput: { width: '100%', minHeight: '60px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical' },
        gradeButton: { padding: '5px 10px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '10px', marginTop: '5px' },
        link: { color: '#3b82f6', textDecoration: 'none' },
        submitted: { color: '#10b981', fontWeight: 'bold' },
        graded: { color: '#4f46e5', fontWeight: 'bold' },
    };

    if (isLoading) return <div style={styles.overlay}><div style={styles.modal}>Loading submissions...</div></div>;
    if (error) return <div style={styles.overlay}><div style={styles.modal}>Error: {error}</div></div>;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 style={{margin: '0 0 15px 0'}}>Submissions for: {assignment.title} (Max Points: {assignment.maxPoints})</h2>
                <span style={styles.closeButton} onClick={onClose}>&times;</span>
                
                {submissions.length === 0 ? (
                    <p style={{textAlign: 'center', padding: '20px', backgroundColor: '#eff6ff'}}>No submissions received yet.</p>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Student Name</th>
                                <th style={styles.th}>Submitted At</th>
                                <th style={styles.th}>Submission</th>
                                <th style={styles.th}>Grade / {assignment.maxPoints}</th>
                                <th style={styles.th}>Feedback</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map(sub => (
                                <tr key={sub.id}>
                                    <td style={styles.td}>{sub.student.name}</td>
                                    <td style={styles.td}>{new Date(sub.submittedAt).toLocaleString()}</td>
                                    <td style={styles.td}>
                                        {sub.filePath && (
                                            <p>File: <a href={sub.filePath} target="_blank" rel="noopener noreferrer" style={styles.link}>View Link</a></p>
                                        )}
                                        {sub.submissionText && (
                                            <p>Text: {sub.submissionText.substring(0, 150)}{sub.submissionText.length > 150 ? '...' : ''}</p>
                                        )}
                                    </td>
                                    <td style={styles.td}>
                                        <input 
                                            type="number" 
                                            min="0" 
                                            max={assignment.maxPoints} 
                                            value={gradeInput[sub.id]} 
                                            onChange={(e) => handleGradeChange(sub.id, e.target.value)} 
                                            style={styles.gradeInput}
                                        />
                                    </td>
                                    <td style={styles.td}>
                                        <textarea
                                            value={feedbackInput[sub.id]}
                                            onChange={(e) => handleFeedbackChange(sub.id, e.target.value)}
                                            style={styles.feedbackInput}
                                            placeholder="Add feedback here..."
                                        />
                                    </td>
                                    <td style={styles.td}>
                                        <button 
                                            onClick={() => handleSaveGrade(sub.id)} 
                                            style={styles.gradeButton}
                                        >
                                            {sub.grade !== null ? 'Update Grade' : 'Save Grade'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default LecturerSubmissionListView;