import React from 'react';

function AssignmentTable({ assignments, onEdit, onDelete, onGrade }) { 
    if (!assignments || assignments.length === 0) {
        return (
            <p style={styles.info}>
                No assignments have been created for this course yet. Use the "Create New Assignment" button.
            </p>
        );
    }

    return (
        <div style={styles.tableWrapper}>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Assignment Title</th>
                        <th style={styles.th}>Due Date</th>
                        <th style={styles.th}>Submissions</th>
                        <th style={styles.th}>Needs Grading</th>
                        <th style={styles.th}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {assignments.map(assignment => (
                        <tr key={assignment.id}>
                            <td style={styles.td}>{assignment.title}</td>
                            <td style={styles.td}>{new Date(assignment.dueDate).toLocaleDateString('en-GB')}</td>
                            <td style={styles.td}>{assignment.submissions || 0}</td>
                            <td style={styles.tdNeedsGrading}>
                                {Math.max(0, (assignment.submissions || 0) - (assignment.graded || 0))}
                            </td>
                            <td style={styles.tdActions}>
                                <button onClick={() => onEdit(assignment)} style={styles.editButton}>
                                    Edit
                                </button>
                                <button onClick={() => onDelete(assignment.id, assignment.title)} style={styles.deleteButton}>
                                    Delete
                                </button>
                                <button onClick={() => onGrade(assignment)} style={styles.gradeButton}>
                                    Grade Submissions
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ----------------------------------------------------------------------
// --- STYLES ---
// ----------------------------------------------------------------------
const styles = {
    info: { padding: '20px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '4px', textAlign: 'center', marginTop: '20px' },
    tableWrapper: { overflowX: 'auto', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', marginTop: '20px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { borderBottom: '2px solid #374151', padding: '15px', textAlign: 'left', backgroundColor: '#f3f4f6', color: '#1f2937' },
    td: { borderBottom: '1px solid #e5e7eb', padding: '15px', color: '#374151', textAlign: 'center' },
    tdNeedsGrading: { borderBottom: '1px solid #e5e7eb', padding: '15px', color: '#ef4444', fontWeight: 'bold', textAlign: 'center' },
    tdActions: { borderBottom: '1px solid #e5e7eb', padding: '10px 15px', display: 'flex', gap: '8px', justifyContent: 'center' },
    
    editButton: { padding: '6px 10px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9em' },
    deleteButton: { padding: '6px 10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9em' },
    gradeButton: { padding: '6px 10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9em' },
};

export default AssignmentTable;