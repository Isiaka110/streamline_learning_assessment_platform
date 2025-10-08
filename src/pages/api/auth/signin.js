// pages/auth/signin.js

import { useState } from 'react';
import { signIn, getCsrfToken } from 'next-auth/react';
import { useRouter } from 'next/router';

// This function gets the CSRF token before the page is rendered (Server-Side)
export async function getServerSideProps(context) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}

export default function SignIn({ csrfToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    // 1. Call the signIn function from NextAuth.js
    const result = await signIn('credentials', {
      redirect: false, // Prevent automatic redirection
      email,
      password,
      // The callbackUrl specifies where to redirect upon successful login
      callbackUrl: '/dashboard', // We'll assume your main dashboard is at /dashboard
    });

    // 2. Handle the result
    if (result.error) {
      // CredentialsProvider returns an error if authorization fails
      setError('Invalid email or password. Please try again.');
      console.error('Sign-in Error:', result.error);
    } else if (result.url) {
      // Success: Redirect the user
      router.push(result.url);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Lecturer & Student Sign In</h2>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* CSRF Token is required for form submissions in NextAuth */}
        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

        {/* Error message display */}
        {error && <p style={styles.error}>{error}</p>}
        
        <label htmlFor="email" style={styles.label}>Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />

        <label htmlFor="password" style={styles.label}>Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          Sign In
        </button>
      </form>
      
      <p style={styles.signupText}>
          Need an account? {/* This link will eventually point to a registration page */}
          <a href="/auth/register" style={styles.signupLink}> Register Here</a>
      </p>
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