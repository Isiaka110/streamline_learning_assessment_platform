// pages/admin/dashboard.js

import React from 'react';
import { useSession } from 'next-auth/react';

export default function AdminDashboard() {
  const { data: session } = useSession();

  if (session?.user?.role !== 'ADMIN') {
    return <h1>Access Denied: Administrators Only</h1>;
  }

  return (
    <div style={adminStyles.dashboardContainer}>
      <h1 style={adminStyles.header}>System Administrator Panel </h1>
      <p style={adminStyles.subHeader}>Welcome, {session.user.name || session.user.email}! Manage the LMS platform.</p>

      <div style={adminStyles.grid}>
        
        {/* User Management */}
        <div style={adminStyles.card}>
          <h2 style={adminStyles.cardTitle}>User Accounts</h2>
          <p>Create, edit, and deactivate Lecturer and Admin accounts.</p>
          <button style={adminStyles.actionButton}>Manage Users</button>
        </div>

        {/* System Logs and Metrics */}
        <div style={adminStyles.card}>
          <h2 style={adminStyles.cardTitle}>Platform Monitoring</h2>
          <p>View system logs, performance metrics, and security audits.</p>
          <button style={adminStyles.actionButton}>View Reports</button>
        </div>
        
        {/* Role and Permissions */}
        <div style={adminStyles.card}>
          <h2 style={adminStyles.cardTitle}>System Configuration</h2>
          <p>Adjust global settings and permissions for user roles.</p>
          <button style={adminStyles.actionButton}>Configure Roles</button>
        </div>

        {/* NEW: User Management Card */}
      <div style={adminStyles.card}>
        <h2 style={adminStyles.cardTitle}>User Management</h2>
        <AdminCreateUserForm /> {/* <--- The new form */}
      </div>
      </div>
    </div>
  );
}

// Simple internal styling for Admin
const adminStyles = {
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
        borderLeft: '4px solid #ef4444', // Red for Admin
    },
    cardTitle: {
        fontSize: '1.5em',
        color: '#b91c1c',
        marginBottom: '15px',
    },
    actionButton: {
        marginTop: '15px',
        padding: '10px 15px',
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    }
};