// pages/admin/compose-announcement.js

import React, { useState } from 'react';
import { withAuthGuard } from '../../components/AuthGuard';
import { UserRole } from '@prisma/client';
import LogoContainer from '../../components/LogoContainer';

function ComposeAnnouncement() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('');
        
        if (!title.trim() || !content.trim()) {
            setStatus({ type: 'error', message: 'Title and content cannot be empty.' });
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/admin/announcements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, content }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus({ type: 'success', message: '✅ Announcement posted successfully to all users!' });
                setTitle('');
                setContent('');
            } else {
                setStatus({ type: 'error', message: data.message || 'Failed to post announcement. Check API logs.' });
            }
        } catch (error) {
            console.error("Network error posting announcement:", error);
            setStatus({ type: 'error', message: 'Network error. Could not connect to the server.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.brandingArea}>
                <LogoContainer /> <span style={styles.abbreviation}>LMS</span>
            </div>
            
            <h1 style={styles.header}>📢 Compose New Announcement</h1>
            <p style={styles.subHeader}>Create a platform-wide post visible to all Lecturers and Students.</p>
            
            <form onSubmit={handleSubmit} style={styles.form}>
                
                {/* Status Message Display */}
                {status && (
                    <div style={{ ...styles.message, backgroundColor: status.type === 'success' ? '#d1e7dd' : '#f8d7da', color: status.type === 'success' ? '#0f5132' : '#842029' }}>
                        {status.message}
                    </div>
                )}

                {/* Title Input */}
                <div style={styles.formGroup}>
                    <label htmlFor="title" style={styles.label}>Title:</label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={styles.input}
                        placeholder="e.g., Semester Break Schedule"
                        required
                        disabled={isLoading}
                    />
                </div>

                {/* Content/Body Textarea */}
                <div style={styles.formGroup}>
                    <label htmlFor="content" style={styles.label}>Content (Body):</label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={styles.textarea}
                        rows="8"
                        placeholder="Provide details of the announcement here..."
                        required
                        disabled={isLoading}
                    />
                </div>

                <button type="submit" style={styles.submitButton} disabled={isLoading}>
                    {isLoading ? 'Posting...' : 'Post Announcement'}
                </button>
            </form>
        </div>
    );
}

// Enforce ADMIN role access
export default withAuthGuard(ComposeAnnouncement, [UserRole.ADMIN]);


const styles = {
    container: { padding: '30px', maxWidth: '800px', margin: 'auto', fontFamily: 'Arial, sans-serif' },
    brandingArea: { display: 'flex', alignItems: 'center', marginBottom: '30px' },
    abbreviation: { fontSize: '1.5em', fontWeight: '900', color: '#4f46e5', marginLeft: '10px', letterSpacing: '1px' },
    header: { fontSize: '2em', color: '#1f2937', marginBottom: '10px' },
    subHeader: { color: '#6b7280', marginBottom: '25px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px' },
    form: { backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' },
    input: { width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', fontSize: '1em' },
    textarea: { width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', fontSize: '1em', resize: 'vertical' },
    submitButton: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#10b981', // Emerald green
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '1.1em',
        transition: 'background-color 0.2s',
    },
    message: { padding: '15px', borderRadius: '4px', marginBottom: '20px', fontWeight: 'bold' }
};