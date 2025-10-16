// pages/auth/signin.js

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        const result = await signIn('credentials', {
            redirect: false, // Prevents automatic redirect, allowing custom handling
            email,
            password,
        });

        if (result.error) {
            // Display error message from the authentication provider
            setError('Invalid credentials or access denied.'); 
        } else {
            // Success: Push the user to the generic dashboard route.
            // The logic in the /pages/dashboard.js file (or middleware) will 
            // read the session role and redirect to the specific dashboard (e.g., /dashboard/lecturer).
            router.push('/dashboard');
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>LMS Login</h1>
            <p>Please use your registered email and password.</p>
            
            <form onSubmit={handleLogin} style={styles.form}>
                <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Email" 
                    style={styles.input}
                    required 
                />
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Password" 
                    style={styles.input}
                    required 
                />
                <button type="submit" style={styles.button}>Sign In</button>
            </form>
            {error && <p style={styles.error}>{error}</p>}
        </div>
    );
}
// Simple internal styles for clarity (You should replace this with proper CSS modules or Tailwind)
const styles = {
  container: {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  heading: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  input: {
    padding: '10px',
    marginBottom: '15px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  button: {
    padding: '10px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  error: {
    color: 'red',
    marginBottom: '10px',
    textAlign: 'center',
  },
  signupText: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '0.9em',
  },
  signupLink: {
    color: '#0070f3',
    textDecoration: 'none',
    fontWeight: 'bold',
  }
};