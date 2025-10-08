// components/AssignmentGradingTool.js

import React, { useState, useEffect } from 'react';

const GradingForm = ({ submission, maxPoints, onGradeUpdate }) => {
  const [grade, setGrade] = useState(submission.grade || 0);
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Update local state when submission prop changes (for switching students)
  useEffect(() => {
    setGrade(submission.grade || 0);
    setFeedback(submission.feedback || '');
    setMessage('');
  }, [submission]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    // Ensure grade is within bounds before submitting
    const numGrade = parseInt(grade);
    if (isNaN(numGrade) || numGrade < 0 || numGrade > maxPoints) {
        setMessage(`Error: Grade must be a number between 0 and ${maxPoints}.`);
        setLoading(false);
        return;
    }

    try {
      // Call the Grading API
      const response = await fetch(`/api/submissions/${submission.id}/grade`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            grade: numGrade, 
            feedback: feedback 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        onGradeUpdate(submission.id, data.submission); // Update parent state
      } else {
        setMessage(`Error: ${data.message || 'Failed to update grade.'}`);
      }
    } catch (error) {
      setMessage('Network error during grading.');
    } finally {
      setLoading(false);
    }
  };

  const fileUrl = submission.submissionPath; // e.g., /submissions/filename.pdf

  return (
    <div style={styles.gradingCard}>
      <h4>Grade Submission by: {submission.student.name}</h4>
      <p style={{fontSize: '0.9em', color: '#555'}}>Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>
      
      {/* Link to Download/View Submission File */}
      {fileUrl ? (
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={styles.downloadLink}>
              Download Submission File
          </a>
      ) : (
          <p>No file submitted.</p>
      )}

      <form onSubmit={handleSubmit} style={{marginTop: '15px'}}>
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
          rows="3"
          style={styles.textarea}
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Saving...' : `Save Grade (${grade}/${maxPoints})`}
        </button>
        {message && <p style={{ color: message.startsWith('Error') ? 'red' : 'green', marginTop: '10px' }}>{message}</p>}
      </form>
    </div>
  );
};


const AssignmentGradingTool = ({ assignmentId, assignmentTitle }) => {
  const [submissions, setSubmissions] = useState([]);
  const [maxPoints, setMaxPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/assignments/${assignmentId}/submissions`);
      const data = await response.json();

      if (response.ok) {
        setSubmissions(data.submissions);
        setMaxPoints(data.maxPoints);
      } else {
        setError(data.message || 'Failed to fetch submissions.');
      }
    } catch (err) {
      setError('Network error fetching submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assignmentId) {
      fetchSubmissions();
    }
  }, [assignmentId]);

  // Handler to update the local state when a grade is submitted
  const handleGradeUpdate = (submissionId, updatedSubmission) => {
    setSubmissions(prev => 
      prev.map(sub => (sub.id === submissionId ? updatedSubmission : sub))
    );
  };
  
  if (!assignmentId) return <p>Select an assignment to view submissions.</p>;
  if (loading) return <p>Loading submissions...</p>;
  if (error) return <p style={{color: 'red'}}>Error: {error}</p>;
  
  const gradedCount = submissions.filter(s => s.grade !== null).length;

  return (
    <div style={styles.container}>
      <h2>Submissions for: {assignmentTitle}</h2>
      <p style={styles.summaryText}>Total Submissions: {submissions.length} | Graded: {gradedCount} | Pending: {submissions.length - gradedCount}</p>

      {submissions.length === 0 ? (
        <p>No submissions found for this assignment.</p>
      ) : (
        <div style={styles.submissionsGrid}>
          {submissions.map(submission => (
            <GradingForm 
              key={submission.id}
              submission={submission}
              maxPoints={maxPoints}
              onGradeUpdate={handleGradeUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentGradingTool;

const styles = {
    container: { padding: '20px', borderTop: '2px solid #0070f3', marginTop: '20px' },
    summaryText: { fontSize: '1.1em', fontWeight: 'bold', marginBottom: '20px' },
    submissionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' },
    gradingCard: { padding: '15px', border: '1px solid #e0e0e0', borderRadius: '6px', backgroundColor: '#f9f9f9' },
    downloadLink: { display: 'inline-block', padding: '8px', backgroundColor: '#3b82f6', color: 'white', textDecoration: 'none', borderRadius: '4px', marginTop: '5px', fontSize: '0.9em' },
    label: { display: 'block', fontWeight: 'bold', marginTop: '10px' },
    input: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '5px', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '5px', boxSizing: 'border-box' },
    button: { padding: '10px 15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '15px' },
};