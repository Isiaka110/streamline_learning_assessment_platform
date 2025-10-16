// components/SubmissionFormModal.js

import React, { useState, useEffect } from 'react';

const SubmissionFormModal = ({ assignment, studentId, onClose, onSuccess }) => {
    const [textInput, setTextInput] = useState('');
    const [fileInput, setFileInput] = useState(null); // For file object
    const [fileUrl, setFileUrl] = useState(''); // For file path/URL on successful upload
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [existingSubmission, setExistingSubmission] = useState(null);

    // Fetch existing submission data when modal opens
    useEffect(() => {
        const fetchExistingSubmission = async () => {
            if (!assignment || !studentId) return;

            try {
                // This API endpoint would need to be created if not already existing
                // It should fetch a single submission for a given assignment and student
                const res = await fetch(`/api/student/submissions?assignmentId=${assignment.id}`);
                const data = await res.json();
                if (res.ok && data.submission) {
                    setExistingSubmission(data.submission);
                    setTextInput(data.submission.submissionText || '');
                    setFileUrl(data.submission.filePath || '');
                }
            } catch (err) {
                console.error("Error fetching existing submission:", err);
                // Not a critical error if no submission found, just means it's a new submission
            }
        };
        fetchExistingSubmission();
    }, [assignment, studentId]);


    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileInput(file);
        setIsLoading(true);
        setError(null);

        // Simulate file upload (replace with actual upload logic to S3/Cloudinary/your server)
        // For now, let's just create a dummy URL
        try {
            // In a real app, you'd upload the file to a storage service
            // const uploadRes = await fetch('/api/upload', { /* ... */ });
            // const uploadData = await uploadRes.json();
            // setFileUrl(uploadData.fileUrl);

            // Dummy URL for now
            setFileUrl(`https://example.com/uploads/${assignment.id}-${studentId}-${file.name}`);
            alert('File selected (dummy URL generated). Actual upload logic needed.');
        } catch (err) {
            setError('File upload failed.');
            console.error('File upload error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!textInput && !fileUrl) {
            setError('Please provide either text or upload a file.');
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/student/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assignmentId: assignment.id,
                    submissionText: textInput,
                    filePath: fileUrl, 
                }),
            });

            const data = await res.json();

            if (res.ok) {
                alert(data.message);
                if (onSuccess) { // CRITICAL: Call onSuccess to trigger re-fetch in parent
                    onSuccess();
                }
            } else {
                setError(data.message || 'Failed to submit assignment.');
            }
        } catch (err) {
            console.error('Submission API Error:', err);
            setError('Network error while submitting assignment.');
        } finally {
            setIsLoading(false);
        }
    };

    const styles = {
        overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
        modal: { backgroundColor: 'white', padding: '30px', borderRadius: '8px', maxWidth: '600px', width: '90%', position: 'relative', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' },
        closeButton: { position: 'absolute', top: '10px', right: '20px', fontSize: '1.8em', cursor: 'pointer' },
        form: { display: 'flex', flexDirection: 'column', gap: '15px' },
        textarea: { minHeight: '120px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1em' },
        fileInputContainer: { border: '1px dashed #ccc', padding: '15px', borderRadius: '4px', textAlign: 'center' },
        fileLabel: { display: 'block', marginBottom: '10px', color: '#4b5563' },
        filePreview: { marginTop: '10px', fontSize: '0.9em', color: '#3b82f6' },
        submitButton: { padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1.1em', fontWeight: 'bold' },
        error: { padding: '10px', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '4px', marginBottom: '15px' },
        info: { padding: '10px', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', marginBottom: '15px' }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 style={{margin: '0 0 15px 0'}}>
                    {existingSubmission ? 'Update Submission' : 'Submit Assignment'} for: {assignment.title}
                </h2>
                <span style={styles.closeButton} onClick={onClose}>&times;</span>
                
                {error && <p style={styles.error}>{error}</p>}
                {isLoading && <p style={styles.info}>Processing...</p>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <label>Submission Text:</label>
                    <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Type your submission here..."
                        style={styles.textarea}
                        disabled={isLoading}
                    />

                    <div style={styles.fileInputContainer}>
                        <label style={styles.fileLabel}>Or Upload a File:</label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            disabled={isLoading}
                        />
                        {fileUrl && <p style={styles.filePreview}>File uploaded: <a href={fileUrl} target="_blank" rel="noopener noreferrer">{fileUrl.split('/').pop()}</a></p>}
                    </div>

                    <button type="submit" style={styles.submitButton} disabled={isLoading}>
                        {isLoading ? 'Submitting...' : (existingSubmission ? 'Update Submission' : 'Submit Assignment')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SubmissionFormModal;