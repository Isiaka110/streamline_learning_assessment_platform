// components/ResourceUploadForm.js

import React, { useState, useEffect } from 'react';

// NOTE: This modal currently assumes a file path (URL/string) is provided.
// For true file uploads, you would integrate a cloud storage service like Firebase, S3, or handle local storage.
function ResourceUploadForm({ courseId, resource, onClose, onSuccess }) {
    const isEdit = !!resource;

    const [formData, setFormData] = useState({
        title: resource?.title || '',
        filePath: resource?.filePath || '',
        description: resource?.description || '',
    });
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Ensure form data is reset when resource changes (for proper edit/create toggle)
        setFormData({
            title: resource?.title || '',
            filePath: resource?.filePath || '',
            description: resource?.description || '',
        });
    }, [resource]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setError('');
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!formData.title || !formData.filePath) {
            setError('Title and File Path/URL are required.');
            return;
        }

        setIsSaving(true);

        const method = isEdit ? 'PUT' : 'POST';
        const url = '/api/lecturer/resources'; // PUT requests will use this same endpoint.
        
        const payload = isEdit 
            ? { resourceId: resource.id, ...formData }
            : { ...formData, courseId }; // courseId is only needed for creating a new resource

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            
            const data = await res.json();

            if (res.ok) {
                alert(`✅ Resource successfully ${isEdit ? 'updated' : 'uploaded'}.`);
                onSuccess(); // Close modal and refresh list
            } else {
                setError(data.message || `Failed to ${isEdit ? 'update' : 'upload'} resource.`);
            }

        } catch (err) {
            console.error("Save operation network error:", err);
            setError('Network error during save operation.');
        } finally {
            setIsSaving(false);
        }
    };

    const styles = {
        backdrop: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
        modal: { backgroundColor: 'white', padding: '30px', borderRadius: '8px', maxWidth: '500px', width: '90%', position: 'relative', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' },
        header: { margin: '0 0 20px 0', fontSize: '1.5em', borderBottom: '1px solid #eee', paddingBottom: '10px' },
        closeButton: { position: 'absolute', top: '10px', right: '20px', fontSize: '1.5em', cursor: 'pointer' },
        formGroup: { marginBottom: '15px' },
        label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
        input: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
        textarea: { ...this.input, minHeight: '80px', resize: 'vertical' },
        buttonRow: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
        cancelButton: { padding: '10px 15px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
        saveButton: { padding: '10px 15px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
        error: { color: 'white', backgroundColor: '#f87171', padding: '10px', borderRadius: '4px', marginBottom: '15px' }
    };

    return (
        <div style={styles.backdrop} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 style={styles.header}>{isEdit ? `Edit Resource: ${resource.title}` : 'Upload New Resource'}</h2>
                <span style={styles.closeButton} onClick={onClose}>&times;</span>

                {error && <p style={styles.error}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    
                    <div style={styles.formGroup}>
                        <label htmlFor="title" style={styles.label}>Title (e.g., Lecture Slides Week 5):</label>
                        <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} style={styles.input} required />
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="filePath" style={styles.label}>File Path / URL:</label>
                        <input type="url" id="filePath" name="filePath" value={formData.filePath} onChange={handleChange} style={styles.input} required placeholder="https://example.com/files/slides.pdf" />
                        <small style={{ color: '#6b7280' }}>*For a full implementation, this input would typically be replaced by a file uploader to a storage service (e.g., S3, Cloudinary).</small>
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="description" style={styles.label}>Description/Notes (Optional):</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} style={{...styles.input, ...styles.textarea}} />
                    </div>

                    <div style={styles.buttonRow}>
                        <button type="button" onClick={onClose} style={styles.cancelButton} disabled={isSaving}>Cancel</button>
                        <button type="submit" style={styles.saveButton} disabled={isSaving}>
                            {isSaving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Upload Resource')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ResourceUploadForm;