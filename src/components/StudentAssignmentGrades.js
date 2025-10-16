import React from 'react';

function StudentAssignmentGrades({ courses }) {
    // 🔑 NOTE: This component needs to fetch submissions and grades from your API.
    
    // Mock Data based on the old UI's "3 assignments due this week"
    const mockAssignments = [
        { id: 1, courseCode: 'CS101', title: 'Data Structures Final', dueDate: '2025-10-15', status: 'Pending Submission', grade: null },
        { id: 2, courseCode: 'MATH202', title: 'Calculus Quiz 3', dueDate: '2025-10-18', status: 'Graded', grade: 85, feedback: "Good effort, see notes on Q4." },
        { id: 3, courseCode: 'LIT305', title: 'Poetry Analysis Essay', dueDate: '2025-10-22', status: 'Pending Grade', grade: null },
    ];
    
    const assignmentsDueThisWeek = mockAssignments.filter(a => a.status === 'Pending Submission').length;

    return (
        <div style={styles.container}>
            <div style={styles.overviewCard}>
                <h3 style={styles.overviewHeader}>Assignment Overview</h3>
                <p style={styles.deadlineInfo}>
                    You have **{assignmentsDueThisWeek}** assignments due this week.
                </p>
                <button style={styles.viewDeadlinesButton}>View All Deadlines</button>
            </div>

            <h3 style={styles.sectionHeader}>Submissions & Grades</h3>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Course</th>
                        <th style={styles.th}>Assignment</th>
                        <th style={styles.th}>Due Date</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Grade</th>
                        <th style={styles.th}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {mockAssignments.map(assignment => (
                        <tr key={assignment.id}>
                            <td style={styles.td}>{assignment.courseCode}</td>
                            <td style={styles.td}>{assignment.title}</td>
                            <td style={styles.td}>{new Date(assignment.dueDate).toLocaleDateString()}</td>
                            <td style={{...styles.td, color: assignment.status === 'Graded' ? '#10b981' : (assignment.status === 'Pending Submission' ? '#f59e0b' : '#3b82f6')}}>
                                {assignment.status}
                            </td>
                            <td style={styles.td}>
                                **{assignment.grade || '--'}**
                            </td>
                            <td style={styles.tdActions}>
                                {assignment.status === 'Pending Submission' && (
                                    <button style={styles.actionButtonSubmit}>Submit</button>
                                )}
                                {assignment.grade && (
                                    <button style={styles.actionButtonView}>View Feedback</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const styles = {
    container: { padding: '15px' },
    overviewCard: { padding: '20px', backgroundColor: '#e0f2fe', borderLeft: '5px solid #0ea5e9', borderRadius: '8px', marginBottom: '30px' },
    overviewHeader: { fontSize: '1.4em', marginBottom: '10px', color: '#0ea5e9' },
    deadlineInfo: { fontSize: '1.1em', marginBottom: '15px', fontWeight: 'bold' },
    viewDeadlinesButton: { padding: '10px 15px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    sectionHeader: { fontSize: '1.5em', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '20px' },
    table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' },
    th: { borderBottom: '2px solid #333', padding: '12px 15px', textAlign: 'left', backgroundColor: '#f4f4f4', color: '#1f2937' },
    td: { borderBottom: '1px solid #ddd', padding: '12px 15px', color: '#374151', fontSize: '0.95em' },
    tdActions: { borderBottom: '1px solid #ddd', padding: '8px 15px', display: 'flex', gap: '8px', alignItems: 'center' },
    actionButtonSubmit: { padding: '6px 10px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    actionButtonView: { padding: '6px 10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};

export default StudentAssignmentGrades;