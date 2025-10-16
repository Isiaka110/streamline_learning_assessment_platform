// pages/dashboard/admin/index.js

import React from 'react';
import { signOut } from 'next-auth/react';
import { withAuthGuard } from '../../../components/AuthGuard'; 
import LogoContainer from '../../../components/LogoContainer';
import { UserRole } from '@prisma/client';
import Link from 'next/link';

// 🔑 Import Prisma client directly for getServerSideProps
import prisma from '@api/prisma'; 
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@api/auth/[...nextauth]'; 


// Base styles defined as a separate constant for safe referencing
const baseButtonStyles = {
    display: 'block',
    width: '100%',
    textAlign: 'center',
    padding: '12px 10px',
    borderRadius: '8px',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'background-color 0.2s',
    marginTop: '15px',
    fontSize: '0.95em',
};

/**
 * @param {object} props
 * @param {number} props.totalLecturers - Total count of users with LECTURER role.
 * @param {number} props.totalCourses - Total count of all Course records.
 * @param {number} props.unassignedCourses - Total count of Course records without a lecturer.
 * @param {string | null} props.error - An error message if data fetching failed.
 * @param {import('next-auth').Session} props.session - The user session object.
 */
function AdminDashboard({ 
    totalLecturers, 
    totalCourses, 
    unassignedCourses, 
    error,
    session 
}) {

    const handleLogout = () => {
        // Redirects user to the root path after sign out
        signOut({ callbackUrl: '/' }); 
    };
    
    // Render error state if data fetching failed
    if (error) {
        return (
            <div style={styles.container}>
                <p style={styles.error}>{error}</p>
                <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.brandingArea}> 
            <LogoContainer/> <span style={styles.abbreviation}>LMS</span> 
            </div>
            
            {/* Header and Logout */}
            <div style={styles.headerRow}>
                <h1 style={styles.header}>Platform Administration Center ⚙️</h1>
                <button onClick={handleLogout} style={styles.logoutButton}>
                    Logout
                </button>
            </div>
            
            <p style={styles.subHeader}>
                Welcome, {session?.user?.name || 'System Administrator'}. Centralize and optimize platform operations and user access.
            </p>

            {/* MAIN GRID LAYOUT - Strictly the 3 requested cards */}
            <div style={styles.mainGrid}>
                
                {/* 1. Manage Lecturers (C.R.U.D.) */}
                <div style={styles.card}>
                    <h2 style={styles.cardHeader}>Manage Lecturers (C.R.U.D.) 🧑‍🏫</h2>
                    <p style={styles.metric}>
                        **Total Lecturers Available:** <span style={styles.metricValue}>
                            {totalLecturers}
                        </span>
                    </p>
                    <p style={styles.textBlock}>Centralize management for all platform lecturers, including creation and assignment details.</p>
                    <Link href="/dashboard/admin/lecturer-management" style={styles.primaryButton}> 
                        Manage Lecturers
                    </Link>
                </div>

                {/* 2. Manage Course Catalog */}
                <div style={styles.card}>
                    <h2 style={styles.cardHeader}>Manage Course Catalog 📚</h2>
                    <p style={styles.metric}>
                        **Total Active Courses:** <span style={styles.metricValue}>
                            {totalCourses}
                        </span>
                    </p>
                    <p style={styles.metric}>
                        **Courses Needing Lecturer:** <span style={unassignedCourses > 0 ? styles.metricValueRed : styles.metricValue}>
                            {unassignedCourses}
                        </span>
                    </p>
                    <p style={styles.textBlock}>Create, update, and manage the course catalog, and assign lecturers to courses.</p>
                    <Link href="/dashboard/admin/course-management" style={styles.primaryButton}> 
                        Manage Courses & Assignments
                    </Link>
                </div>
                
                {/* 3. System-Wide Announcements (Full-width action) */}
                <div style={{...styles.card, ...styles.fullWidthCard}}>
                    <h2 style={styles.cardHeader}>System-Wide Announcements 📣</h2>
                    <p style={styles.textBlock}>Push critical updates and notifications to all platform users.</p>
                    {/* Assuming this route exists */}
                    <Link href="/admin/compose-announcement" style={styles.tertiaryButton}>
                        Compose New Platform Announcement
                    </Link>
                </div>

            </div>
        </div>
    );
}

// 🔑 getServerSideProps for fetching data and enforcing server-side authorization
export async function getServerSideProps(context) {
    const session = await getServerSession(context.req, context.res, authOptions);

    // --- 1. Authorization Check (Must be ADMIN) ---
    if (!session || session.user.role !== UserRole.ADMIN) {
        return {
            redirect: {
                destination: '/auth/login?error=AccessDenied',
                permanent: false,
            },
        };
    }

    // --- 2. Next.js Serialization Fix ---
    if (session?.user) {
        // Convert any 'undefined' user fields to 'null' for safe serialization
        session.user.image = session.user.image ?? null;
        session.user.name = session.user.name ?? null;
    }

    let totalLecturers = 0;
    let totalCourses = 0;
    let unassignedCourses = 0;
    let error = null;

    // --- 3. Fetch Required Dashboard Metrics ---
    try {
        // Total Lecturers
        totalLecturers = await prisma.user.count({
            where: {
                role: UserRole.LECTURER,
            },
        });

        // Total Courses
        totalCourses = await prisma.course.count();

        // ✅ CRITICAL FIX: Courses Needing Lecturer (Unassigned)
        // Correctly checks for an empty many-to-many relationship using 'none: {}'
        unassignedCourses = await prisma.course.count({
            where: {
                lecturers: { 
                    none: {} // FIX: Use empty object for 'none' filter in count
                }
            }
        });

    } catch (err) {
        console.error("getServerSideProps Admin Stats Error:", err);
        error = 'Failed to load administrator statistics from the database.';
    }

    return {
        props: {
            totalLecturers,
            totalCourses,
            unassignedCourses,
            error, 
            // Final serialization
            session: JSON.parse(JSON.stringify(session)), 
        },
    };
}

// ----------------------------------------------------------------------
// --- STYLES (Your Original Styles) ---
// ----------------------------------------------------------------------
const styles = {
    container: { 
        padding: '20px', 
        maxWidth: '1400px', 
        margin: 'auto', 
        fontFamily: 'system-ui, sans-serif', 
        minHeight: '100vh',
        backgroundColor: '#f9fafb'
    },
    headerRow: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '10px' 
    },
    brandingArea: {
        display: 'flex',
        alignItems: 'center', 
    },
    abbreviation: {
        fontSize: '1.5em', 
        fontWeight: '900',
        color: '#4f46e5', 
        marginRight: '15px',
        marginLeft: '10px',
        letterSpacing: '1px',
        flexShrink: 0, 
        lineHeight: '1', 
        paddingTop: '2px', 
    },
    header: { 
        fontSize: '2em', 
        color: '#1f2937' 
    },
    logoutButton: {
        padding: '8px 15px',
        backgroundColor: '#ef4444', 
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '0.9em'
    },
    subHeader: { 
        color: '#6b7280', 
        marginBottom: '30px', 
        borderBottom: '1px solid #e5e7eb', 
        paddingBottom: '15px' 
    },
    mainGrid: {
        display: 'grid',
        // Sets up three columns, but allows wrapping for smaller screens
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '25px',
    },
    card: {
        padding: '25px',
        border: '1px solid #d1d5db',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '200px',
    },
    fullWidthCard: {
        // Forces this card to span all columns in the grid
        gridColumn: '1 / -1', 
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
    },
    cardHeader: {
        fontSize: '1.4em',
        marginBottom: '15px',
        color: '#374151'
    },
    textBlock: {
        color: '#4b5563',
        marginBottom: '15px',
        flexGrow: 1, 
    },
    metric: {
        fontSize: '1em',
        marginBottom: '10px',
        color: '#4b5563',
        fontWeight: '500',
    },
    metricValue: {
        fontSize: '1.2em',
        fontWeight: 'bold',
        color: '#1f2937',
        marginLeft: '5px',
    },
    metricValueRed: {
        fontSize: '1.2em',
        fontWeight: 'bold',
        color: '#ef4444',
        marginLeft: '5px',
    },
    primaryButton: { 
        backgroundColor: '#4f46e5', 
        color: 'white',
        border: '1px solid #4f46e5',
        ...baseButtonStyles
    },
    tertiaryButton: {
        backgroundColor: '#3b82f6', 
        color: 'white',
        border: '1px solid #3b82f6',
        ...baseButtonStyles
    },
    error: { 
        padding: '15px', 
        backgroundColor: '#fee2e2', 
        color: '#b91c1c', 
        border: '1px solid #fca5a5', 
        borderRadius: '4px', 
        margin: '20px auto',
        maxWidth: '600px',
    }
};

// Apply AuthGuard to enforce client-side redirection if the user somehow lands here without permission
export default withAuthGuard(AdminDashboard, [UserRole.ADMIN]);