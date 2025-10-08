// pages/auth/signin.js

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react'; // Client-side authentication function
import Link from 'next/link';


export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Used to display error messages from NextAuth

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error message on input change
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // 1. Call the NextAuth signIn function using the 'credentials' provider
    const result = await signIn('credentials', {
      redirect: false, // Prevent automatic redirect, so we can handle success/error manually
      email: formData.email,
      password: formData.password,
    });

    // 2. Handle Authentication Result
    if (result.error) {
      // Authentication failed (e.g., incorrect password or email)
      setError(result.error); 
    } else {
      // Authentication successful!
      // The user is redirected to the main dashboard or the page they tried to access previously.
      router.push('/dashboard'); 
      // Note: You should have a dynamic dashboard page that redirects based on role 
      // (e.g., /student/dashboard or /lecturer/dashboard). For now, we use /dashboard.
    }

    setLoading(false);
  };
  
  // Note: NextAuth often appends an error query parameter to the URL upon failed redirect.
  // We can capture and display specific errors like 'CredentialsSignin'.
  const { error: urlError } = router.query;
  
  // Choose the error to display: the one from the URL (after a failed redirect) 
  // or the one from the manual signIn call.
  const displayError = error || urlError;

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Welcome Back</h1>
      <p style={styles.subheading}>Sign in to your LMS account.</p>
      
      {/* Error Message Display */}
      {displayError && (
        <p style={styles.errorText}>
          {displayError === 'CredentialsSignin' 
            ? 'Invalid email or password. Please try again.' 
            : `Error: ${displayError}`
          }
        </p>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
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
          style={styles.input}
        />

        <button 
          type="submit" 
          disabled={loading} 
          style={styles.button}
        >
          {loading ? 'Logging In...' : 'Sign In'}
        </button>
      </form>
      
      <p style={styles.linkText}>
        New user? 
        <Link href="/auth/register" style={styles.authLink}>
          Register Here
        </Link>
      </p>
    </div>
  );
}

// Simple internal styles (matching the register page for consistency)
const styles = {
    container: {
        maxWidth: '400px',
        margin: '50px auto',
        padding: '30px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        backgroundColor: 'white',
    },
    heading: {
        textAlign: 'center',
        color: '#1f2937',
        marginBottom: '5px',
    },
    subheading: {
        textAlign: 'center',
        color: '#6b7280',
        marginBottom: '20px',
        fontSize: '1em'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    label: { 
        fontWeight: 'bold', 
        marginTop: '10px',
        color: '#374151'
    },
    input: { 
        padding: '10px', 
        border: '1px solid #d1d5db', 
        borderRadius: '4px',
        fontSize: '1em'
    },
    button: { 
        padding: '12px', 
        backgroundColor: '#2563eb', // Different color for Sign In
        color: 'white', 
        border: 'none', 
        borderRadius: '4px', 
        cursor: 'pointer', 
        marginTop: '20px', 
        fontSize: '1em',
        fontWeight: 'bold'
    },
    errorText: { 
        color: 'red', 
        backgroundColor: '#ffe6e6', 
        padding: '10px', 
        borderRadius: '4px', 
        textAlign: 'center' 
    },
    linkText: { 
        textAlign: 'center', 
        marginTop: '15px', 
        fontSize: '0.9em' 
    },
    authLink: { 
        color: '#2563eb', 
        textDecoration: 'none', 
        marginLeft: '5px' 
    }
};