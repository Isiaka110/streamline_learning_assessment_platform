// pages/student/grades.js

import React, { useState, useEffect } from 'react';
import { withAuthGuard } from '../../components/AuthGuard';
import { UserRole } from '@prisma/client';

function StudentGradesView() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      // Call the student's personal submissions API
      const response = await fetch('/api/submissions/my');
      const data = await response.json();

      if (response.ok) {
        setSubmissions(data.submissions);
      } else {
        setError(data.message || 'Failed to fetch your grades.');
      }
    } catch (err) {
      setError('Network error fetching grades.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  if (loading) return <p style={styles.message}>Loading your grades and feedback...</p>;
  if (error) return <p style={{...styles.message, color: 'red'}}>Error: {error}</p>;

  return (
    <div style={styles.pageContainer}>
      <h1>My Grades and Submissions 📝</h1>
      <p style={styles.introText}>Review the status, scores, and feedback for all your assignments.</p>
      
      {submissions.length === 0 ? (
        <p style={styles.noData}>You have not submitted any assignments yet.</p>
      ) : (
        <div style={styles.gridContainer}>
          {submissions.map(submission => {
            const assignment = submission.assignment;
            const course = assignment.course;
            
            // Determine display status and color
            let statusText = 'Pending Grading';
            let statusColor = '#facc15'; // Yellow
            if (submission.grade !== null) {
              statusText = 'Graded';
              statusColor = '#10b981'; // Green
            }
            
            const gradeDisplay = submission.grade !== null 
                                 ? `${submission.grade} / ${assignment.maxPoints}` 
                                 : 'N/A';
            
            return (
              <div key={submission.id} style={styles.card}>
                <div style={{...styles.statusBadge, backgroundColor: statusColor}}>{statusText}</div>
                
                <h3 style={styles.cardTitle}>{assignment.title}</h3>
                <p style={styles.courseInfo}>{course.code}: {course.title} (Lecturer: {course.lecturer.name})</p>
                
                <hr style={styles.divider} />
                
                <p><strong>Score:</strong> <span style={styles.gradeText}>{gradeDisplay}</span></p>
                <p><strong>Submitted On:</strong> {new Date(submission.submittedAt).toLocaleDateString()}</p>
                <p><strong>Due Date:</strong> {new Date(assignment.dueDate).toLocaleDateString()}</p>

                {submission.feedback && (
                  <div style={styles.feedbackBox}>
                    <strong>Feedback from Lecturer:</strong>
                    <p>{submission.feedback}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Protect the route: Only STUDENTs are allowed access
export default withAuthGuard(StudentGradesView, [UserRole.STUDENT]);

// Simple internal styles (consistent with previous components)
const styles = {
    pageContainer: { padding: '20px', maxWidth: '1200px', margin: 'auto' },
    introText: { marginBottom: '25px', color: '#555' },
    gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' },
    card: { padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', position: 'relative', backgroundColor: 'white' },
    statusBadge: { position: 'absolute', top: '0', right: '0', padding: '5px 10px', color: 'white', fontSize: '0.8em', fontWeight: 'bold', borderRadius: '0 8px 0 8px' },
    cardTitle: { marginTop: '0', marginBottom: '5px', fontSize: '1.4em' },
    courseInfo: { fontSize: '0.9em', color: '#777', fontStyle: 'italic' },
    divider: { borderTop: '1px solid #eee', margin: '15px 0' },
    gradeText: { fontWeight: 'bold', fontSize: '1.1em', color: '#0070f3' },
    feedbackBox: { marginTop: '15px', padding: '10px', borderLeft: '3px solid #f97316', backgroundColor: '#fff7ed' },
    message: { textAlign: 'center', marginTop: '50px' },
    noData: { textAlign: 'center', padding: '30px', backgroundColor: '#f0f0f0', borderRadius: '6px' }
};