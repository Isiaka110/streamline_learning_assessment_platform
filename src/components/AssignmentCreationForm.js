// components/AssignmentCreationForm.js

import React, { useState, useEffect } from 'react';

const AssignmentCreationForm = ({ lecturerCourses }) => {
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxPoints, setMaxPoints] = useState(100);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Set initial courseId if only one course exists
  useEffect(() => {
    if (lecturerCourses && lecturerCourses.length === 1) {
      setCourseId(lecturerCourses[0].id);
    }
  }, [lecturerCourses]);

  // Reset all form state fields
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setMaxPoints(100);
    setMessage('');
    // Keep courseId selected if multiple courses exist
    if (lecturerCourses.length > 1) {
      setCourseId('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    if (!courseId) {
      setMessage('Please select a course for the assignment.');
      setIsError(true);
      setLoading(false);
      return;
    }

    try {
      // 1. Call the dynamic API route we just created
      const response = await fetch(`/api/courses/${courseId}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            title, 
            description, 
            dueDate, 
            maxPoints: parseInt(maxPoints) 
        }),
      });

      const data = await response.json();

      // 2. Handle API Response
      if (response.ok) {
        setMessage(`Success! Assignment "${data.assignment.title}" created for course ${data.assignment.course.code}.`);
        setIsError(false);
        resetForm(); // Clear form on success
      } else {
        setMessage(`Error: ${data.message || 'Failed to create assignment.'}`);
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
  
  // Display an error if no courses are available
  if (!lecturerCourses || lecturerCourses.length === 0) {
    return <p style={{color: 'red'}}>You must create a course before creating an assignment.</p>
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
      
      {/* Assignment Title */}
      <label htmlFor="title" style={styles.label}>Assignment Title</label>
      <input
        id="title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        disabled={loading}
        style={styles.input}
      />

      {/* Due Date */}
      <label htmlFor="dueDate" style={styles.label}>Due Date</label>
      <input
        id="dueDate"
        type="datetime-local" // Use datetime-local for specific date and time
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        required
        disabled={loading}
        style={styles.input}
      />

      {/* Max Points */}
      <label htmlFor="maxPoints" style={styles.label}>Maximum Points</label>
      <input
        id="maxPoints"
        type="number"
        value={maxPoints}
        onChange={(e) => setMaxPoints(e.target.value)}
        required
        disabled={loading}
        min="1"
        style={styles.input}
      />

      {/* Description */}
      <label htmlFor="description" style={styles.label}>Description (Instructions)</label>
      <textarea
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={loading}
        rows="4"
        style={styles.textarea}
      />

      <button 
        type="submit" 
        disabled={loading || !courseId} 
        style={styles.button}
      >
        {loading ? 'Creating Assignment...' : 'Create Assignment'}
      </button>
    </form>
  );
};

export default AssignmentCreationForm;

// Basic internal styles for reference (keep using the same style pattern)
const styles = {
    // ... (Use the same form styles from CourseCreationForm)
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
    textarea: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical' },
    button: { padding: '12px', backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '15px', fontSize: '16px', transition: 'background-color 0.3s' },
    successText: { color: 'green', backgroundColor: '#e6ffe6', padding: '10px', borderRadius: '4px', border: '1px solid #ccebcc', textAlign: 'center', fontWeight: 'bold' },
    errorText: { color: 'red', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '4px', border: '1px solid #eccce6', textAlign: 'center', fontWeight: 'bold' },
};