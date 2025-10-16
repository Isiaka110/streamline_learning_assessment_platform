import React, { useState, useEffect, useCallback } from 'react';

/**
 * Fetches and displays assignments and grades for a specific course/student.
 * * NOTE: Assumes the existence of /api/student/courses/[courseId]/assignments route.
 */
function CourseAssignmentGrades({ courseId }) {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAssignmentData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/student/courses/${courseId}/assignments`);
            const data = await response.json();

            if (response.ok) {
                setAssignments(data.assignments || []);
                setError(null);
            } else {
                setError(data.message || 'Failed to load assignment data.');
            }
        } catch (err) {
            console.error("Network error fetching assignments:", err);
            setError('Network error: Could not fetch assignments/grades.');
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        if (courseId) {
            fetchAssignmentData();
        }
    }, [fetchAssignmentData, courseId]);

    const getGradeDisplay = (submission, maxPoints) => {
        if (!submission) return 'Not Submitted';
        if (submission.grade === null) return 'Submitted (Pending)';
        return `${submission.grade}/${maxPoints}`;
    };
    
    // Renders the list of assignments, matching the desired output format
    const renderAssignments = () => (
        <div style={styles.assignmentList}>
            {assignments.map(assignment => (
                <div key={assignment.id} style={styles.card}>
                    <div style={styles.textGroup}>
                        <h5 style={styles.cardTitle}>{assignment.title}</h5>
                        <p style={styles.cardDetail}>Due: {new Date(assignment.dueDate).toLocaleDateString('en-GB')}</p>
                    </div>
                    <div style={styles.gradeGroup}>
                        <span style={styles.gradeStatus}>
                            Grade: **{getGradeDisplay(assignment.submission, assignment.maxPoints)}**
                        </span>
                        <button style={styles.actionButton}>View/Submit</button>
                    </div>
                </div>
            ))}
        </div>
    );

    if (loading) return <p style={styles.loading}>Loading assignments and grades...</p>;
    if (error) return <p style={styles.error}>Error loading assignments: {error}</p>;

    return (
        <div style={styles.container}>
            <h4 style={styles.header}>Assignments & Grades ({assignments.length})</h4>
            {assignments.length === 0 ? (
                <p style={styles.info}>No assignments have been posted for this course yet.</p>
            ) : (
                renderAssignments()
            )}
        </div>
    );
}

// ----------------------------------------------------------------------
// --- STYLES (Adapted from previous responses) ---
// ----------------------------------------------------------------------

const styles = {
    container: { borderTop: '1px solid #ddd', paddingTop: '20px', marginTop: '20px' },
    header: { fontSize: '1.3em', marginBottom: '15px', color: '#374151' },
    loading: { color: '#3b82f6' },
    error: { color: '#b91c1c' },
    info: { color: '#4b5563' },
    assignmentList: { display: 'flex', flexDirection: 'column', gap: '10px' },
    card: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '10px', 
        backgroundColor: '#f9fafb',
        border: '1px solid #eee',
        borderRadius: '4px'
    },
    textGroup: { flexGrow: 1 },
    cardTitle: { margin: 0, fontSize: '1em', color: '#1f2937' },
    cardDetail: { margin: 0, fontSize: '0.8em', color: '#6b7280' },
    gradeGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
    gradeStatus: { fontWeight: 'bold', color: '#059669' },
    actionButton: { 
        padding: '6px 12px', 
        backgroundColor: '#4f46e5', 
        color: 'white', 
        border: 'none', 
        borderRadius: '4px', 
        cursor: 'pointer',
        fontSize: '0.9em'
    }
};

export default CourseAssignmentGrades;