// components/GlobalAnnouncements.js

import React, { useState, useEffect, useCallback } from 'react';

function GlobalAnnouncements() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAnnouncements = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/announcements/all');
            const data = await response.json();

            if (response.ok) {
                setAnnouncements(data.announcements || []);
                setError(null);
            } else {
                setError(data.message || 'Failed to load announcements.');
            }
        } catch (err) {
            console.error("Network error fetching announcements:", err);
            setError('Network error: Could not fetch announcements.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    return (
        <div style={styles.container}>
            <h3 style={styles.header}>Global Announcements ({announcements.length})</h3>
            
            {loading ? (
                <p style={styles.loading}>Loading latest announcements...</p>
            ) : error ? (
                <p style={styles.error}>Error: {error}</p>
            ) : announcements.length === 0 ? (
                <p style={styles.info}>No recent announcements from the administration.</p>
            ) : (
                <div style={styles.announcementList}>
                    {announcements.map(announcement => (
                        <div key={announcement.id} style={styles.card}>
                            <h4 style={styles.cardTitle}>{announcement.title}</h4>
                            <p style={styles.cardContent}>{announcement.content}</p>
                            <span style={styles.cardTime}>
                                Posted: {new Date(announcement.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const styles = {
    container: { padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' },
    header: { fontSize: '1.6em', marginBottom: '15px', color: '#1f2937', borderBottom: '2px solid #ddd', paddingBottom: '10px' },
    loading: { textAlign: 'center', padding: '20px', color: '#3b82f6' },
    error: { padding: '15px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '4px' },
    info: { padding: '15px', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '4px' },
    announcementList: { display: 'flex', flexDirection: 'column', gap: '15px' },
    card: { 
        padding: '15px', 
        border: '1px solid #e5e7eb', 
        borderRadius: '6px', 
        backgroundColor: '#fff',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    },
    cardTitle: { fontSize: '1.1em', marginBottom: '5px', color: '#4f46e5' },
    cardContent: { fontSize: '0.95em', color: '#374151', marginBottom: '10px' },
    cardTime: { fontSize: '0.75em', color: '#9ca3af', display: 'block', textAlign: 'right' }
};

export default GlobalAnnouncements;