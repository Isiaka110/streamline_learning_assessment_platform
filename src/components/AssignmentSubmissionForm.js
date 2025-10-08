// components/AssignmentSubmissionForm.js

import React, { useState } from 'react';

const AssignmentSubmissionForm = ({ assignmentId, assignmentTitle, onSubmissionSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    if (!file) {
      setMessage('Please select a file to upload.');
      setIsError(true);
      setLoading(false);
      return;
    }

    // 1. Create FormData object for file uploads
    const formData = new FormData();
    formData.append('submissionFile', file); // 'submissionFile' must match the key used in lib/file-handler.js

    try {
      // 2. Client-Side Data Fetching (Calling the file-enabled API)
      const response = await fetch(`/api/assignments/${assignmentId}/submit`, {
        method: 'POST',
        // IMPORTANT: Do NOT set 'Content-Type': 'multipart/form-data'. 
        // The browser sets it automatically with the correct boundary when using FormData.
        body: formData,
      });

      const data = await response.json();

      // 3. Handle API Response
      if (response.ok) {
        setMessage(data.message);
        setIsError(false);
        setFile(null); // Clear file input
        onSubmissionSuccess(assignmentId); // Notify parent component
      } else {
        setMessage(`Submission Failed: ${data.message || 'An unknown error occurred.'}`);
        setIsError(true);
      }
    } catch (error) {
      console.error('Submission network error:', error);
      setMessage('A network error occurred during submission.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.formContainer}>
      
      <h3>Submit for: {assignmentTitle}</h3>
      
      {message && (
        <p style={isError ? styles.errorText : styles.successText}>
          {message}
        </p>
      )}

      <label htmlFor="submissionFile" style={styles.label}>Select File (Max 5MB)</label>
      <input
        id="submissionFile"
        type="file"
        onChange={handleFileChange}
        required
        disabled={loading}
        style={styles.input}
      />
      {file && <p style={styles.fileName}>Selected: {file.name}</p>}

      <button 
        type="submit" 
        disabled={loading || !file} 
        style={styles.button}
      >
        {loading ? 'Uploading...' : 'Upload & Submit Assignment'}
      </button>
    </form>
  );
};

export default AssignmentSubmissionForm;

// Basic styles (simplified)
const styles = {
    formContainer: {
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    label: { fontWeight: 'bold', marginTop: '5px' },
    input: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px' },
    button: { padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '15px' },
    successText: { color: 'green', backgroundColor: '#e6ffe6', padding: '10px', borderRadius: '4px', textAlign: 'center' },
    errorText: { color: 'red', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '4px', textAlign: 'center' },
    fileName: { fontSize: '0.9em', color: '#555' }
};