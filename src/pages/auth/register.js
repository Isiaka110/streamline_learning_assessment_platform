// pages/auth/register.js

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

// The role is hardcoded here to STUDENT, as this is the self-registration page.
const DEFAULT_ROLE = 'STUDENT'; 

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); 
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (message) setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setIsError(false);

    // Basic Validation Check
    if (!formData.name || !formData.email || !formData.password) {
        setMessage('Error: All fields are required.');
        setIsError(true);
        setLoading(false);
        return;
    }
    
    try {
      // The role field is included to explicitly tell the API this is a STUDENT registration.
      const payload = { ...formData, role: DEFAULT_ROLE };

      // Call the User Creation API: POST /api/users
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Success! Your student account has been created. Click on the Sign In link below to access your dashboard.`);
        setIsError(false);
        // Redirect to the sign-in page after a short delay
        setTimeout(() => {
            router.push('/auth/signin');
        }, 2000);
        
      } else {
        // API returned an error (e.g., 409 Email exists)
        setMessage(`Registration Failed: ${data.message || 'An unknown error occurred.'}`);
        setIsError(true);
      }
    } catch (error) {
      console.error('Network error during registration:', error);
      setMessage('A network error occurred. Please try again.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Student Registration</h1>
      <p style={styles.subText}>Sign up to access your courses and learning materials.</p>
      
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
        <label htmlFor="password" style={styles.label}>Password</label>
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

        <button 
          type="submit" 
          disabled={loading || !formData.email || !formData.password || !formData.name} 
          style={styles.button}
        >
          {loading ? 'Registering...' : 'Register as Student'}
        </button>
      </form>
      
      <p style={styles.loginLink}>
        Already have an account? <Link href="/auth/SignIn" style={styles.link}>Sign In</Link>
      </p>
    </div>
  );
}

// Simple internal styling
const styles = {
    container: {
        maxWidth: '450px',
        margin: '50px auto',
        padding: '30px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        backgroundColor: 'white',
    },
    heading: {
        fontSize: '2em',
        marginBottom: '5px',
        color: '#1f2937'
    },
    subText: {
        fontSize: '1em',
        color: '#6b7280',
        marginBottom: '20px',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '10px'
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
        backgroundColor: '#3b82f6', // Student/Core LMS color
        color: 'white', 
        border: 'none', 
        borderRadius: '4px', 
        cursor: 'pointer', 
        marginTop: '20px', 
        fontSize: '1em',
        fontWeight: 'bold'
    },
    loginLink: {
        textAlign: 'center',
        marginTop: '20px',
        fontSize: '0.9em'
    },
    link: {
        color: '#3b82f6',
        textDecoration: 'none',
        fontWeight: 'bold'
    },
    successText: { color: 'green', backgroundColor: '#e6ffe6', padding: '10px', borderRadius: '4px', textAlign: 'center' },
    errorText: { color: 'red', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '4px', textAlign: 'center' },
};