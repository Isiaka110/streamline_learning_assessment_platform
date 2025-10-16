// components/AnnouncementList.js

import React from 'react';

const AnnouncementList = ({ announcements, isLoading, error }) => {

    const styles = {
        card: { 
            backgroundColor: '#ffffff', 
            padding: '20px', 
            borderRadius: '8px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
            marginBottom: '20px' 
        },
        title: { 
            fontSize: '1.5em', 
            color: '#1f2937', 
            borderBottom: '2px solid #f3f4f6', 
            paddingBottom: '10px', 
            marginBottom: '10px' 
        },
        announcementItem: {
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '15px',
            marginBottom: '15px',
            backgroundColor: '#f9fafb',
        },
        announcementTitle: {
            fontSize: '1.2em',
            color: '#3b82f6',
            marginBottom: '5px',
            fontWeight: 'bold',
        },
        announcementDate: {
            fontSize: '0.85em',
            color: '#6b7280',
            marginBottom: '10px',
            display: 'block',
        },
        announcementContent: {
            fontSize: '1em',
            color: '#4b5563',
            lineHeight: '1.5',
            whiteSpace: 'pre-wrap', // Preserves formatting from the admin input
        },
        info: { padding: '20px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '4px', textAlign: 'center' },
        error: { padding: '15px', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '4px', marginBottom: '20px' },
    };

    if (isLoading) {
        return <p style={styles.info}>Loading platform announcements... ⏳</p>;
    }

    if (error) {
        return <p style={styles.error}>Error loading announcements: {error}</p>;
    }

    if (announcements.length === 0) {
        return <p style={styles.info}>No announcements have been posted by the admin yet.</p>;
    }

    return (
        <div style={styles.card}>
            <h2 style={styles.title}>Latest Platform Announcements</h2>
            {announcements.map((announcement) => (
                <div key={announcement.id} style={styles.announcementItem}>
                    <h3 style={styles.announcementTitle}>{announcement.title}</h3>
                    <span style={styles.announcementDate}>
                        Posted: {new Date(announcement.createdAt).toLocaleDateString('en-GB', { 
                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                    </span>
                    <p style={styles.announcementContent}>{announcement.content}</p>
                </div>
            ))}
        </div>
    );
};

export default AnnouncementList;