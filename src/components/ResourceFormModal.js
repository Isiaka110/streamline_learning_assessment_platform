// File: components/ResourceFormModal.js

import React, { useState, useEffect } from 'react';

// Simplified Modal Styles (omitted for brevity)

function ResourceFormModal({ courseId, resource, onClose, onSuccess }) {
    const isEdit = !!resource;
    const [formData, setFormData] = useState({
        title: resource?.title || '',
        description: resource?.description || '',
    });
    const [file, setFile] = useState(null); 
    const [currentFileUrl, setCurrentFileUrl] = useState(resource?.filePath || ''); 
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData({
            title: resource?.title || '',
            description: resource?.description || '',
        });
        setCurrentFileUrl(resource?.filePath || '');
        setFile(null);
    }, [resource]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setError('');
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setError('');
        // We expect the file input name to be 'file' in the form data
        setFile(e.target.files[0]); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!formData.title) { setError('Title is required.'); return; }
        // For POST (New Resource), a file is required. For PUT (Edit), a file is optional.
        if (!isEdit && !file) { setError('A file must be selected for upload.'); return; }
        // For PUT, if editing, either a new file OR the existing file path must be present
        if (isEdit && !file && !currentFileUrl) { setError('Resource file information is missing.'); return; }

        setIsSaving(true);
        
        // 1. Prepare FormData (CRITICAL for file uploads)
        const formPayload = new FormData();
        formPayload.append('title', formData.title);
        formPayload.append('description', formData.description || '');
        
        // 🔑 FIX 1: Remove courseId from payload. It's sent via the URL parameter.
        // formPayload.append('courseId', courseId); // REMOVED

        // 🔑 CRITICAL FIX 2: Ensure the field name for the file matches the API handler (lib/file-handler.js)
        // The API handler is flexible, but using a generic name like 'file' is best.
        if (file) {
            // Must match the key used in the API handler (e.g., 'file')
            formPayload.append('file', file); 
        } 
        
        // Note: For PUT, we don't send 'filePath' in the payload. 
        // If 'file' is null, the PUT API knows to keep the existing file.
        // If a new file is present, the API handles replacing the old file.

        // 2. Determine API Method and URL
        const method = isEdit ? 'PUT' : 'POST';
        
        // 🔑 CRITICAL FIX 3: Construct the CORRECT URL based on the API file path
        // POST: /api/courses/[courseId]/resources 
        // PUT: /api/courses/[courseId]/resources/[resourceId] (Assuming you need a separate handler for PUT/DELETE)
        
        let url;
        if (isEdit) {
            // Assuming your edit endpoint is pages/api/courses/[courseId]/resources/[resourceId].js
            url = `/api/courses/${courseId}/resources/${resource.id}`; 
        } else {
            // Your upload endpoint: pages/api/courses/[courseId]/resources/index.js
            url = `/api/courses/${courseId}/resources`; 
        }

        try {
            const res = await fetch(url, {
                method,
                // CRITICAL: Do NOT set Content-Type header when uploading FormData. 
                // The browser sets it automatically with the correct boundary.
                body: formPayload, 
            });
            
            const data = res.status !== 204 ? await res.json().catch(() => ({})) : {}; 

            if (res.ok) {
                alert(`✅ Resource successfully ${isEdit ? 'updated' : 'uploaded'}.`);
                onSuccess(); 
            } else {
                setError(data.message || `Failed to ${isEdit ? 'update' : 'upload'} resource. Status: ${res.status}`);
            }

        } catch (err) {
            console.error("Save operation network error:", err);
            setError('Network error during save operation. Check console for details.');
        } finally {
            setIsSaving(false);
        }
    };

    // ... (rest of the component JSX, which is correct) ...
    const styles = {
        backdrop: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
        modal: { backgroundColor: 'white', padding: '30px', borderRadius: '8px', maxWidth: '500px', width: '90%', position: 'relative', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' },
        header: { margin: '0 0 20px 0', fontSize: '1.5em', borderBottom: '1px solid #eee', paddingBottom: '10px' },
        closeButton: { position: 'absolute', top: '10px', right: '20px', fontSize: '1.5em', cursor: 'pointer' },
        formGroup: { marginBottom: '15px' },
        label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
        input: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
        textarea: { minHeight: '80px', resize: 'vertical' },
        buttonRow: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
        cancelButton: { padding: '10px 15px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
        saveButton: { padding: '10px 15px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
        error: { color: 'white', backgroundColor: '#f87171', padding: '10px', borderRadius: '4px', marginBottom: '15px' }
    };

    return (
        <div style={styles.backdrop} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 style={styles.header}>{isEdit ? `Edit Resource: ${resource?.title || ''}` : 'Upload New Resource'}</h2>
                <span style={styles.closeButton} onClick={onClose}>&times;</span>

                {error && <p style={styles.error}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    
                    <div style={styles.formGroup}>
                        <label htmlFor="title" style={styles.label}>Title:</label>
                        <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} style={styles.input} required disabled={isSaving} />
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="file" style={styles.label}>{isEdit ? 'Upload New File (Optional)' : 'Select File (PDF, DOCX, Image, etc.)'}:</label>
                        <input type="file" id="file" name="file" onChange={handleFileChange} style={styles.input} required={!isEdit && !currentFileUrl} disabled={isSaving} />
                        {isEdit && currentFileUrl && 
                            <small style={{ color: '#6b7280', display: 'block', marginTop: '5px' }}>
                                Current File: <a href={currentFileUrl} target="_blank" rel="noopener noreferrer">{currentFileUrl.split('/').pop()}</a>
                                <br/>Leave blank to keep existing file.
                            </small>
                        }
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="description" style={styles.label}>Description/Notes (Optional):</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} style={{...styles.input, ...styles.textarea}} disabled={isSaving} />
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

export default ResourceFormModal;