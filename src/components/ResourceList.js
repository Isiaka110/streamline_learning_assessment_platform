// components/ResourceList.js

import React from 'react';

const ResourceList = ({ resources, isLoading, error, onEdit, onDelete }) => {
    const styles = {
        table: { width: '100%', borderCollapse: 'collapse', marginTop: '15px' },
        th: { borderBottom: '2px solid #e5e7eb', padding: '12px', textAlign: 'left', backgroundColor: '#f9fafb' },
        td: { borderBottom: '1px solid #e5e7eb', padding: '12px', verticalAlign: 'top' },
        actionButton: { margin: '0 5px', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', border: 'none', fontSize: '0.9em' },
        editButton: { backgroundColor: '#fcd34d', color: '#78350f' },
        deleteButton: { backgroundColor: '#f87171', color: 'white' },
        info: { padding: '15px', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', textAlign: 'center', margin: '20px 0' },
        error: { padding: '15px', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '4px', margin: '20px 0' },
    };

    if (isLoading) return <p style={styles.info}>Loading resources...</p>;
    if (error) return <p style={styles.error}>Error: {error}</p>;

    if (resources.length === 0) {
        return <p style={styles.info}>No resources have been uploaded for this course yet.</p>;
    }

    return (
        <table style={styles.table}>
            <thead>
                <tr>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Description/Notes</th>
                    <th style={styles.th}>File Link</th>
                    <th style={styles.th}>Uploaded On</th>
                    <th style={styles.th}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {resources.map((resource) => (
                    <tr key={resource.id}>
                        <td style={styles.td}>{resource.title}</td>
                        <td style={styles.td}>{resource.description || 'N/A'}</td>
                        <td style={styles.td}>
                            <a href={resource.filePath} target="_blank" rel="noopener noreferrer">
                                {resource.filePath.split('/').pop()}
                            </a>
                        </td>
                        <td style={styles.td}>
                            {new Date(resource.uploadedAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td style={styles.td}>
                            <button 
                                onClick={() => onEdit(resource)} 
                                style={{ ...styles.actionButton, ...styles.editButton }}
                            >
                                Edit
                            </button>
                            <button 
                                onClick={() => onDelete(resource.id, resource.title)} 
                                style={{ ...styles.actionButton, ...styles.deleteButton }}
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default ResourceList;