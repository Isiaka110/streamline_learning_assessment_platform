// components/CourseCreationForm.js

import React, { useState } from 'react';

const CourseCreationForm = () => {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Function to reset the form state
  const resetForm = () => {
    setTitle('');
    setCode('');
    setDescription('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      // 1. Client-Side Data Fetching (Calling the Business Logic Layer API)
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, code, description }),
      });

      const data = await response.json();

      // 2. Handle API Response
      if (response.ok) {
        // Success
        setMessage(`Success! Course "${data.course.title}" (${data.course.code}) created.`);
        setIsError(false);
        resetForm(); // Clear the form after successful submission
      } else {
        // Handle application errors (400, 403, 409, 500)
        setMessage(`Error: ${data.message || 'Failed to create course.'}`);
        setIsError(true);
      }
    } catch (error) {
      // Handle network errors
      console.error('Network or unexpected error:', error);
      setMessage('An unexpected error occurred. Check your network.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.formContainer}>
      
      {/* Display Success or Error Messages */}
      {message && (
        <p style={isError ? styles.errorText : styles.successText}>
          {message}
        </p>
      )}

      {/* Course Title */}
      <label htmlFor="title" style={styles.label}>Course Title</label>
      <input
        id="title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        disabled={loading}
        style={styles.input}
      />

      {/* Course Code */}
      <label htmlFor="code" style={styles.label}>Course Code (e.g., CS101)</label>
      <input
        id="code"
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())} // Ensure code is uppercase
        required
        disabled={loading}
        maxLength={10}
        style={styles.input}
      />

      {/* Course Description */}
      <label htmlFor="description" style={styles.label}>Description (Optional)</label>
      <textarea
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={loading}
        rows="4"
        style={styles.textarea}
      />

      {/* Submit Button */}
      <button 
        type="submit" 
        disabled={loading} 
        style={styles.button}
      >
        {loading ? 'Creating Course...' : 'Create Course'}
      </button>
    </form>
  );
};

export default CourseCreationForm;

// Basic internal styles (you'll replace this with proper CSS)
const styles = {
  formContainer: {
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  label: {
    fontWeight: 'bold',
    marginTop: '5px',
  },
  input: {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  textarea: {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    resize: 'vertical',
  },
  button: {
    padding: '12px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '15px',
    fontSize: '16px',
    transition: 'background-color 0.3s',
  },
  successText: {
    color: 'green',
    backgroundColor: '#e6ffe6',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccebcc',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    backgroundColor: '#ffe6e6',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #eccce6',
    textAlign: 'center',
    fontWeight: 'bold',
  },
};