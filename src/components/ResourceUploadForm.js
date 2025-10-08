// components/ResourceUploadForm.js

import React, { useState } from 'react';

const ResourceUploadForm = ({ lecturerCourses }) => {
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const resetForm = () => {
    setTitle('');
    setFile(null);
    // Note: Leaving courseId selected if multiple courses exist
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    if (!courseId || !title || !file) {
      setMessage('Please select a course, provide a title, and choose a file.');
      setIsError(true);
      setLoading(false);
      return;
    }

    // 1. Create FormData for file and text data
    const formData = new FormData();
    formData.append('title', title);
    // 'submissionFile' must match the key used in lib/file-handler.js
    formData.append('submissionFile', file); 

    try {
      // 2. Call the dynamic API route
      const response = await fetch(`/api/courses/${courseId}/resources`, {
        method: 'POST',
        // IMPORTANT: No Content-Type header needed for FormData
        body: formData,
      });

      const data = await response.json();

      // 3. Handle API Response
      if (response.ok) {
        setMessage(data.message);
        setIsError(false);
        resetForm(); // Clear form on success
      } else {
        setMessage(`Error: ${data.message || 'Failed to upload resource.'}`);
        setIsError(true);
      }
    } catch (error) {
      console.error('Network or unexpected error:', error);
      setMessage('An unexpected error occurred. Check your network.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };
  
  if (!lecturerCourses || lecturerCourses.length === 0) {
    return <p style={{color: 'red'}}>You must create a course before uploading resources.</p>
  }

  return (
    <form onSubmit={handleSubmit} style={styles.formContainer}>
      
      {message && (
        <p style={isError ? styles.errorText : styles.successText}>
          {message}
        </p>
      )}

      {/* Course Selection */}
      <label htmlFor="courseId" style={styles.label}>Select Course</label>
      <select
        id="courseId"
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        required
        disabled={loading}
        style={styles.select}
      >
        <option value="" disabled>-- Select a Course --</option>
        {lecturerCourses.map(course => (
          <option key={course.id} value={course.id}>
            {course.code}: {course.title}
          </option>
        ))}
      </select>
      
      {/* Resource Title */}
      <label htmlFor="title" style={styles.label}>Resource Title (e.g., Week 5 Slides)</label>
      <input
        id="title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        disabled={loading}
        style={styles.input}
      />

      {/* File Upload */}
      <label htmlFor="resourceFile" style={styles.label}>Select File (Max 5MB)</label>
      <input
        id="resourceFile"
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        required
        disabled={loading}
        style={styles.input}
      />
      {file && <p style={styles.fileName}>Selected: {file.name}</p>}

      <button 
        type="submit" 
        disabled={loading || !courseId || !title || !file} 
        style={styles.button}
      >
        {loading ? 'Uploading Resource...' : 'Upload Resource'}
      </button>
    </form>
  );
};

export default ResourceUploadForm;

// Basic internal styles (consistent with previous components)
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
    select: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px' },
    button: { padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '15px', fontSize: '16px', transition: 'background-color 0.3s' },
    successText: { color: 'green', backgroundColor: '#e6ffe6', padding: '10px', borderRadius: '4px', border: '1px solid #ccebcc', textAlign: 'center', fontWeight: 'bold' },
    errorText: { color: 'red', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '4px', border: '1px solid #eccce6', textAlign: 'center', fontWeight: 'bold' },
    fileName: { fontSize: '0.9em', color: '#555' }
};