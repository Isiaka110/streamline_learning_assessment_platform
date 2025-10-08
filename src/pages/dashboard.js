// pages/dashboard.js

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const ROLE_REDIRECTS = {
  STUDENT: '/student/dashboard',
  LECTURER: '/lecturer/dashboard',
  ADMIN: '/admin/dashboard',
  // Ensure that all roles defined in your UserRole enum are handled here
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // 1. Loading State
    if (status === 'loading') {
      return; // Wait for session to load
    }

    // 2. Unauthenticated State (Security Check)
    if (status === 'unauthenticated') {
      // If not logged in, force a redirect to the sign-in page
      router.replace('/auth/signin');
      return;
    }

    // 3. Authenticated State (Role-Based Redirect)
    if (session?.user?.role) {
      const userRole = session.user.role;
      const destination = ROLE_REDIRECTS[userRole];

      if (destination) {
        // Redirect the user to their specific dashboard based on their role
        router.replace(destination);
      } else {
        // Handle a role that doesn't have a defined redirect
        console.error(`Error: Unhandled role '${userRole}'. Defaulting to sign-in.`);
        router.replace('/auth/signin');
      }
    }
  }, [status, session, router]);

  // While loading or redirecting, display a minimal loading message
  return (
    <div style={styles.loadingContainer}>
      <h1 style={styles.title}>Welcome to the LMS</h1>
      <p style={styles.text}>Processing authentication and routing...</p>
      {/* Optional: Add a simple spinner or animation */}
    </div>
  );
}

// Simple internal styling
const styles = {
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb'
    },
    title: {
        color: '#1f2937',
        fontSize: '2em',
        marginBottom: '10px'
    },
    text: {
        color: '#6b7280',
        fontSize: '1.1em'
    }
};