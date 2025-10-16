// File: components/AdminLecturerTable.js (UPDATED - Simplified)

import React from 'react';

const AdminLecturerTable = ({ lecturers, onEdit, onDelete }) => {
    
    // Simplified headers: removed 'role' and 'createdOn'
    const headers = [
        { key: 'name', label: 'Lecturer Name' },
        { key: 'email', label: 'Email' },
        { key: 'courses', label: 'Courses Assigned 📚' },
        { key: 'actions', label: 'Actions' },
    ];

    const styles = {
        tableWrapper: { overflowX: 'auto', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
        table: { width: '100%', borderCollapse: 'collapse' },
        th: { borderBottom: '2px solid #374151', padding: '15px', textAlign: 'left', backgroundColor: '#f3f4f6', color: '#1f2937' },
        td: { borderBottom: '1px solid #e5e7eb', padding: '15px', color: '#374151', verticalAlign: 'top' },
        tdCenter: { borderBottom: '1px solid #e5e7eb', padding: '20px', textAlign: 'center', color: '#6b7280' },
        tdActions: { borderBottom: '1px solid #e5e7eb', padding: '10px 15px', display: 'flex', gap: '10px' },
        editButton: { padding: '8px 12px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
        deleteButton: { padding: '8px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
        noAssignText: { color: '#ef4444', fontWeight: 'bold' },
        courseTag: { 
            display: 'inline-block',
            backgroundColor: '#e0f2f7', 
            color: '#0e7490',           
            padding: '3px 8px',
            borderRadius: '12px',
            fontSize: '0.75em',
            marginRight: '5px',
            marginBottom: '5px',
            whiteSpace: 'nowrap',
        },
    };

    if (!lecturers || lecturers.length === 0) {
        return <p style={{ padding: '20px', textAlign: 'center' }}>No lecturers found.</p>;
    }

    return (
        <div style={styles.tableWrapper}>
            <table style={styles.table}>
                <thead>
                    <tr>
                        {headers.map(header => (
                            <th key={header.key} style={styles.th}>{header.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {lecturers.map((lecturer) => (
                        <tr key={lecturer.id}>
                            <td style={styles.td}>{lecturer.name}</td>
                            <td style={styles.td}>{lecturer.email}</td>
                            
                            <td style={styles.td}>
                                {/* Assuming the API returns assigned courses in the 'courses' field */}
                                {lecturer.courses && lecturer.courses.length > 0 
                                    ? lecturer.courses.map(course => (
                                        <span key={course.id} style={styles.courseTag}>{course.code}</span>
                                      )) 
                                    : <span style={styles.noAssignText}>None Assigned</span>
                                }
                            </td>

                            {/* Removed the lecturer.role and lecturer.createdAt cells */}
                            
                            <td style={styles.tdActions}>
                                <button 
                                    onClick={() => onEdit(lecturer)} 
                                    style={styles.editButton}
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => onDelete(lecturer.id, lecturer.name)} 
                                    style={styles.deleteButton}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminLecturerTable;