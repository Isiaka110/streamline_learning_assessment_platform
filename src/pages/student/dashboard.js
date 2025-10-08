// pages/student/dashboard.js

import React from 'react';
import { useSession } from 'next-auth/react';
import MessageList from '../../components/MessageList'; // Assume MessageList is one level up

export default function StudentDashboard() {
  const { data: session } = useSession();

  // Ensure the user is authenticated and is a Student before rendering
  if (session?.user?.role !== 'STUDENT') {
    // Note: The main /dashboard.js already handles unauthorized redirection, 
    // but this check adds client-side resilience.
    return <h1>Access Denied: Students Only</h1>;
  }

  return (
    <div style={styles.dashboardContainer}>
      <h1 style={styles.header}>Welcome Back, {session.user.name || session.user.email}! 👋</h1>
      <p style={styles.subHeader}>Your Student Learning Hub</p>

      {/* --- Main Content Areas --- */}
      <div style={styles.grid}>
        
        {/* Course List / Enrollment Component Placeholder */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>My Enrolled Courses</h2>
          <p>List of courses and progress will go here.</p>
          <button style={styles.actionButton}>View All Courses</button>
        </div>

        {/* Message Component Integration */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Platform Messages</h2>
          {/* We integrate the MessageList component here */}
          <MessageList />
          <button style={styles.actionButton}>Compose New</button>
        </div>
      </div>
    </div>
  );
}

// Simple internal styling
const styles = {
    dashboardContainer: {
        padding: '30px',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
    },
    header: {
        fontSize: '2.5em',
        color: '#1f2937',
        marginBottom: '5px',
    },
    subHeader: {
        fontSize: '1.2em',
        color: '#6b7280',
        marginBottom: '30px',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '15px'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '25px',
    },
    card: {
        backgroundColor: '#ffffff',
        padding: '25px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
        borderLeft: '4px solid #3b82f6',
    },
    cardTitle: {
        fontSize: '1.5em',
        color: '#1d4ed8',
        marginBottom: '15px',
    },
    actionButton: {
        marginTop: '15px',
        padding: '10px 15px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    }
};