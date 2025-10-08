// components/AdminCreateUserForm.js

import React, { useState } from 'react';

// Define available roles based on your Prisma enum (excluding the default self-registration role)
const ROLES_TO_CREATE = [
    { value: 'LECTURER', label: 'Lecturer' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'STUDENT', label: 'Student (Admin-created)' },
];

export default function AdminCreateUserForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '', // Role is required for Admin creation
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); 
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear status message on input change
    if (message) setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setIsError(false);

    // Basic Validation Check
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
        setMessage('Error: All fields are required.');
        setIsError(true);
        setLoading(false);
        return;
    }
    
    try {
      // Call the User Creation API: POST /api/users
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Success! ${data.user.name} created as ${data.user.role}.`);
        // Clear the form fields after successful creation
        setFormData({ name: '', email: '', password: '', role: '' }); 
      } else {
        // API returned an error (e.g., 409 Email exists, 403 Forbidden)
        setMessage(`Creation Failed: ${data.message || 'An unknown error occurred.'}`);
        setIsError(true);
      }
    } catch (error) {
      console.error('Network error during user creation:', error);
      setMessage('A network error occurred. Check your server connection.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Create New User Account (Admin)</h2>
      
      {/* Status Message */}
      {message && (
        <p style={isError ? styles.errorText : styles.successText}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        
        {/* Name */}
        <label htmlFor="name" style={styles.label}>Full Name</label>
        <input
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={loading}
          style={styles.input}
        />

        {/* Email */}
        <label htmlFor="email" style={styles.label}>Email Address</label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={loading}
          style={styles.input}
        />

        {/* Password */}
        <label htmlFor="password" style={styles.label}>Initial Password</label>
        <input
          id="password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={loading}
          minLength="8"
          style={styles.input}
        />

        {/* Role Selector */}
        <label htmlFor="role" style={styles.label}>Select Role</label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          disabled={loading}
          style={styles.input}
        >
          <option value="" disabled>-- Select a role --</option>
          {ROLES_TO_CREATE.map(r => (
              <option key={r.value} value={r.value}>
                  {r.label}
              </option>
          ))}
        </select>

        <button 
          type="submit" 
          disabled={loading || !formData.email || !formData.password || !formData.role} 
          style={styles.button}
        >
          {loading ? 'Creating User...' : 'Create User'}
        </button>
      </form>
    </div>
  );
}

// Simple internal styling
const styles = {
    container: {
        maxWidth: '500px',
        margin: '20px auto',
        padding: '30px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        backgroundColor: 'white',
    },
    heading: {
        fontSize: '1.5em',
        marginBottom: '20px',
        borderBottom: '2px solid #ef4444', // Admin color
        paddingBottom: '10px',
        color: '#1f2937'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    label: { 
        fontWeight: 'bold', 
        marginTop: '10px',
        color: '#374151',
        fontSize: '0.9em'
    },
    input: { 
        padding: '10px', 
        border: '1px solid #d1d5db', 
        borderRadius: '4px',
        fontSize: '1em'
    },
    button: { 
        padding: '12px', 
        backgroundColor: '#ef4444', 
        color: 'white', 
        border: 'none', 
        borderRadius: '4px', 
        cursor: 'pointer', 
        marginTop: '20px', 
        fontSize: '1em',
        fontWeight: 'bold'
    },
    successText: { color: 'green', backgroundColor: '#e6ffe6', padding: '10px', borderRadius: '4px', textAlign: 'center' },
    errorText: { color: 'red', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '4px', textAlign: 'center' },
};