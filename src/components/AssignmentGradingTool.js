// :::::::2:::::::: components/AssignmentGradingTool.js
import React, { useState, useEffect } from 'react';

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

    // Determine card background based on grading status
    const cardStyle = {
        ...styles.gradingCard,
        borderLeft: isGraded ? '5px solid #10b981' : '5px solid #f59e0b',
        opacity: isGraded ? 0.95 : 1,
    };

    const gradeTagStyle = {
        ...styles.gradeTag,
        backgroundColor: isGraded ? '#d1fae5' : '#fef3c7',
        color: isGraded ? '#065f46' : '#92400e',
    };

    return (
        <div style={cardStyle}>
            <div style={styles.cardHeader}>
                <h4 style={styles.studentName}>{submission.student.name}</h4>
                <div style={gradeTagStyle}>
                    {isGraded ? `Graded: ${submission.grade}/${maxPoints}` : 'Pending Grade'}
                </div>
            </div>
            
            <p style={styles.submissionDate}>Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>
            
            {/* Download Link Section */}
            <div style={styles.fileSection}>
                {fileUrl ? (
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={styles.downloadLink}>
                        ⬇️ Download Submission File ({fileUrl.split('.').pop().toUpperCase()})
                    </a>
                ) : (
                    <p style={styles.noFile}>No file submitted by the student.</p>
                )}
            </div>

            <form onSubmit={handleSubmit} style={styles.gradingForm}>
                <label style={styles.label}>Grade ({maxPoints} Max):</label>
                <input 
                    type="number" 
                    value={grade} 
                    onChange={(e) => setGrade(e.target.value)} 
                    min="0"
                    max={maxPoints}
                    required
                    style={styles.input}
                />

                <label style={styles.label}>Feedback:</label>
                <textarea 
                    value={feedback} 
                    onChange={(e) => setFeedback(e.target.value)} 
                    rows="4"
                    placeholder="Provide constructive feedback here..."
                    style={styles.textarea}
                />

                <button type="submit" disabled={loading} style={styles.button}>
                    {loading ? 'Saving...' : `Save Grade (${grade}/${maxPoints})`}
                </button>
                {message && <p style={{ color: message.startsWith('Error') ? '#b91c1c' : '#065f46', marginTop: '10px', fontSize: '0.9em' }}>{message}</p>}
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

    const fetchSubmissions = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/assignments/${assignmentId}/submissions`); 
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Server error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setSubmissions(data.submissions);
            setMaxPoints(data.maxPoints); 

        } catch (err) {
            console.error("Fetch Submissions Error:", err);
            setError(`Error: ${err.message || 'Network error fetching submissions.'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (assignmentId) {
            fetchSubmissions();
        }
    }, [assignmentId]);

    const handleGradeUpdate = (submissionId, updatedSubmission) => {
        setSubmissions(prev => 
            prev.map(sub => (sub.id === submissionId ? updatedSubmission : sub))
        );
    };
    
    if (!assignmentId) return <p>Select an assignment to view submissions.</p>;
    if (loading) return <p style={styles.loading}>Loading submissions...</p>;
    if (error) return <p style={styles.error}>Error: {error}</p>;
    
    // Sort submissions: Pending first, then Graded
    const sortedSubmissions = [...submissions].sort((a, b) => {
        if (a.grade === null && b.grade !== null) return -1; // a (pending) comes before b (graded)
        if (a.grade !== null && b.grade === null) return 1;  // a (graded) comes after b (pending)
        return new Date(b.submittedAt) - new Date(a.submittedAt); // Otherwise, sort by latest submission
    });

    const gradedCount = submissions.filter(s => s.grade != null).length;
    const pendingCount = submissions.length - gradedCount;

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>Grade Submissions: {assignmentTitle}</h2>
            
            <div style={styles.summaryBox}>
                <p style={styles.summaryItem}>Total Submissions: <strong style={{color: '#3b82f6'}}>{submissions.length}</strong></p>
                <p style={styles.summaryItem}>Graded: <strong style={{color: '#10b981'}}>{gradedCount}</strong></p>
                <p style={styles.summaryItem}>Pending: <strong style={{color: '#f59e0b'}}>{pendingCount}</strong></p>
            </div>

            {submissions.length === 0 ? (
                <p style={styles.info}>No submissions found for this assignment.</p>
            ) : (
                // 🔑 The submissionsGrid ensures multiple student cards are listed cleanly
                <div style={styles.submissionsGrid}>
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
                <div style={styles.completionMessage}>
                    <p style={{fontWeight: 'bold', fontSize: '1.1em'}}>🎉 All submissions have been graded! 🎉</p>
                    <button 
                        onClick={() => onGradingComplete(true)} 
                        style={styles.backButton}
                    >
                        Return to Assignment List
                    </button>
                </div>
            )}
        </div>
    );
};

// --- STYLES ---
const styles = {
    // Main Container Styles
    container: { padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh' },
    header: { fontSize: '1.8em', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginBottom: '20px' },
    loading: { color: '#3b82f6', padding: '20px' },
    error: { color: '#b91c1c', backgroundColor: '#fee2e2', padding: '15px', borderRadius: '6px', border: '1px solid #fca5a5' },
    
    // Summary Box
    summaryBox: { display: 'flex', gap: '20px', padding: '15px 25px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', marginBottom: '30px' },
    summaryItem: { fontSize: '1em', color: '#4b5563' },
    
    // Grid for Submissions
    submissionsGrid: { display: 'grid', gap: '25px', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))' },
    info: { padding: '20px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', textAlign: 'center' },
    
    // Grading Card Styles
    gradingCard: { 
        padding: '20px', 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px', 
        backgroundColor: '#fff', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        transition: 'transform 0.2s, box-shadow 0.2s',
    },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '10px', marginBottom: '10px' },
    studentName: { fontSize: '1.2em', margin: 0, color: '#1f2937' },
    gradeTag: { padding: '4px 10px', borderRadius: '9999px', fontSize: '0.9em', fontWeight: 'bold' },
    submissionDate: { fontSize: '0.85em', color: '#6b7280', marginBottom: '15px' },
    
    // File Section Styles
    fileSection: { marginBottom: '20px', padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '6px' },
    downloadLink: { 
        display: 'block', 
        padding: '10px 15px', 
        backgroundColor: '#3b82f6', 
        color: 'white', 
        textDecoration: 'none', 
        borderRadius: '4px', 
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '0.95em',
        transition: 'background-color 0.2s',
    },
    noFile: { margin: 0, color: '#9ca3af', fontStyle: 'italic', textAlign: 'center' },
    
    // Form Styles
    gradingForm: { marginTop: '15px' },
    label: { display: 'block', margin: '10px 0 5px', fontWeight: '600', color: '#333' },
    input: { width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', marginBottom: '10px', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical', boxSizing: 'border-box' },
    button: { padding: '10px 15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '15px', fontWeight: 'bold', width: '100%' },

    // Completion Message
    completionMessage: { textAlign: 'center', marginTop: '30px', padding: '30px', backgroundColor: '#d1fae5', borderRadius: '10px', border: '2px solid #34d399', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' },
    backButton: { padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '20px', fontWeight: 'bold' }
};

export default AssignmentGradingTool;