import React, { useState } from 'react';

// This component handles the form input and API call for submitting an assignment.
// It must call onSuccess() after a successful submission.

const AssignmentSubmissionForm = ({ assignmentId, onClose, onSuccess }) => {
    const [submissionText, setSubmissionText] = useState('');
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        // Basic validation
        if (!submissionText && !file) {
            setError("Please provide submission text or upload a file.");
            setIsLoading(false);
            return;
        }

        let filePath = null;

        try {
            // 1. Handle File Upload (Optional - assuming a file upload utility exists)
            // If you have a separate utility for uploading files (e.g., to S3 or a local /public folder)
            // you would call it here and get the path.
            if (file) {
                // IMPORTANT: Replace this placeholder with your actual file upload logic.
                // For this example, we'll create a mock file path.
                // If you don't have file upload implemented, comment this block out for testing.
                filePath = `https://example.com/uploads/${assignmentId}-${Date.now()}-${file.name}`;
                console.log("Mock file upload success. Path:", filePath);
                // In a real app, this would involve a separate API call to handle the file.
            }

            // 2. Submit the assignment data to the API
            const submissionData = {
                assignmentId,
                submissionText,
                filePath, // This will be null if no file was uploaded
            };

            const res = await fetch('/api/student/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccessMessage(data.message || 'Assignment submitted successfully!');
                // CRITICAL FIX: Call onSuccess to notify the parent component (StudentAssignmentView) to refresh its data
                if (onSuccess) {
                    onSuccess();
                }
                setTimeout(onClose, 2000); // Close modal after success
            } else {
                setError(data.message || 'Failed to submit assignment due to an unknown error.');
            }
        } catch (err) {
            console.error('Submission Error:', err);
            setError('Network error while submitting assignment.');
        } finally {
            setIsLoading(false);
        }
    };

    // ... (rest of the component structure, styles, etc.)

    return (
        <form onSubmit={handleSubmit}>
            <h3>Submit Assignment</h3>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            
            <textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Type your submission text here..."
                rows="5"
                disabled={isLoading}
            />

            <input
                type="file"
                onChange={handleFileChange}
                disabled={isLoading}
            />
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                <button type="button" onClick={onClose} disabled={isLoading}>Cancel</button>
                <button type="submit" disabled={isLoading || successMessage}>
                    {isLoading ? 'Submitting...' : 'Submit'}
                </button>
            </div>
        </form>
    );
};

export default AssignmentSubmissionForm;