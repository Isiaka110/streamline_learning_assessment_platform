// components/StudentResourceView.js

import React, { useState, useEffect, useCallback } from 'react';

const StudentResourceView = ({ courseId }) => {
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchResources = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/student/resources?courseId=${courseId}`); // New API route
            const data = await res.json();
            
            if (res.ok) {
                setResources(data.resources);
            } else {
                setError(data.message || 'Failed to load course resources.');
            }
        } catch (err) {
            console.error('Fetch Student Resources Error:', err);
            setError('Network error while fetching resources.');
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    const styles = {
        container: { marginTop: '10px' },
        title: { fontSize: '1.4em', color: '#1f2937', marginBottom: '15px' },
        resourceCard: { 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '15px', 
            marginBottom: '10px', 
            backgroundColor: '#f9fafb',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        },
        resourceTitle: { fontSize: '1.1em', color: '#3b82f6', margin: '0 0 5px 0' },
        resourceDescription: { fontSize: '0.9em', color: '#4b5563', marginBottom: '10px' },
        resourceLink: { fontSize: '0.9em', color: '#4f46e5', textDecoration: 'none', fontWeight: 'bold' },
        uploadedDate: { fontSize: '0.8em', color: '#6b7280', marginTop: '5px' },
        info: { padding: '15px', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', textAlign: 'center' },
        error: { padding: '15px', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '4px', marginBottom: '20px' },
    };

    if (isLoading) return <p style={styles.info}>Loading course resources...</p>;
    if (error) return <p style={styles.error}>Error: {error}</p>;

    return (
        <div style={styles.container}>
            <h3 style={styles.title}>Course Materials and Resources</h3>
            {resources.length === 0 ? (
                <p style={styles.info}>No resources have been uploaded for this course yet.</p>
            ) : (
                resources.map((resource) => (
                    <div key={resource.id} style={styles.resourceCard}>
                        <h4 style={styles.resourceTitle}>{resource.title}</h4>
                        {resource.description && <p style={styles.resourceDescription}>{resource.description}</p>}
                        <a href={resource.filePath} target="_blank" rel="noopener noreferrer" style={styles.resourceLink}>
                            Download/View: {resource.filePath.split('/').pop()}
                        </a>
                        <p style={styles.uploadedDate}>Uploaded: {new Date(resource.uploadedAt).toLocaleDateString()}</p>
                    </div>
                ))
            )}
        </div>
    );
};

export default StudentResourceView;