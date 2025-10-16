import React, { useState, useEffect, useCallback } from 'react';
import { signOut, useSession } from 'next-auth/react'; 
import { withAuthGuard } from '../../../components/AuthGuard';
import { UserRole } from '@prisma/client';
import LogoContainer from '../../../components/LogoContainer'; 
import StudentCourseManager from '../../../components/StudentCourseManager';
import AnnouncementList from '../../../components/AnnouncementList'; 

const mobileBreakpoint = 768; // in pixels

const getStyles = (isMobile) => ({
    // Global container styles
    container: { 
        padding: isMobile ? '15px' : '30px', 
        maxWidth: '1200px', 
        margin: 'auto', 
        fontFamily: 'Arial, sans-serif',
        overflowX: 'hidden', 
        minHeight: '100vh',
    },
    // Header Row: Stacks vertically on mobile
    headerRow: { 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        marginBottom: '20px',
        paddingBottom: isMobile ? '10px' : '0',
        borderBottom: isMobile ? '1px solid #e5e7eb' : 'none',
    },
    brandingArea: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        order: isMobile ? 1 : 1, 
        marginBottom: isMobile ? '10px' : '0',
    },
    abbreviation: {
        fontSize: '1.5em', 
        fontWeight: '900',
        color: '#4f46e5', 
        marginRight: isMobile ? '0' : '15px',
        marginLeft: '10px',
        letterSpacing: '1px',
        flexShrink: 0, 
        lineHeight: '1', 
        paddingTop: '2px', 
        display: isMobile ? 'none' : 'block',
    },
    header: { 
        fontSize: isMobile ? '1.5em' : '2.2em', 
        color: '#1f2937',
        marginLeft: isMobile ? '0' : '10px',
        marginTop: isMobile ? '10px' : '0',
        order: isMobile ? 3 : 2, 
    },
    logoutButton: {
        padding: '8px 15px',
        backgroundColor: '#ef4444', 
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
        fontSize: '0.9em',
        order: isMobile ? 2 : 3, 
        marginTop: isMobile ? '10px' : '0',
    },
    subHeader: { 
        color: '#4b5563', 
        marginBottom: '40px', 
        borderBottom: '1px solid #e5e7eb', 
        paddingBottom: '15px' 
    },
    loading: { textAlign: 'center', padding: '20px', fontSize: '1.2em', color: '#3b82f6' },
    error: { padding: '15px', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '4px', marginBottom: '20px' },
    info: { padding: '20px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '4px', textAlign: 'center' },
    
    // Tab Container: Allows horizontal scrolling on mobile
    tabContainer: { 
        display: 'flex', 
        overflowX: 'auto', 
        whiteSpace: 'nowrap', 
        borderBottom: '2px solid #e5e7eb', 
        marginBottom: '20px',
        paddingBottom: '2px',
        // Mobile padding adjustments
        paddingLeft: isMobile ? '5px' : '0', 
        paddingRight: isMobile ? '5px' : '0',
        marginLeft: isMobile ? '-5px' : '0',
        marginRight: isMobile ? '-5px' : '0',
    },
    tabButton: { 
        padding: isMobile ? '10px 15px' : '10px 20px',
        flexShrink: 0, 
        border: 'none', 
        backgroundColor: 'transparent', 
        cursor: 'pointer', 
        fontWeight: 'normal', 
        fontSize: isMobile ? '0.9em' : '1.1em',
        color: '#6b7280',
        borderBottom: '2px solid transparent',
        transition: 'all 0.3s'
    },
    activeTabButton: {
        padding: isMobile ? '10px 15px' : '10px 20px',
        flexShrink: 0,
        border: 'none', 
        backgroundColor: 'transparent', 
        cursor: 'pointer', 
        fontWeight: 'bold', 
        fontSize: isMobile ? '0.9em' : '1.1em',
        color: '#4f46e5', 
        borderBottom: '2px solid #4f46e5',
    },
    contentArea: {
        padding: isMobile ? '0' : '10px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        minHeight: '400px',
        overflowWrap: 'break-word', 
    }
});

function StudentDashboard() {
    const { data: session, status } = useSession();
    const isSessionLoading = status === 'loading'; 

    const userName = session?.user?.name || "Student"; 
    
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < mobileBreakpoint);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    const styles = getStyles(isMobile);
    
    const [enrolledCourses, setEnrolledCourses] = useState(null);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [errorCourses, setErrorCourses] = useState(null);
    const [activeTab, setActiveTab] = useState('announcements'); 
    
    const [announcements, setAnnouncements] = useState([]);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
    const [errorAnnouncements, setErrorAnnouncements] = useState(null);

    const fetchAnnouncements = useCallback(async () => {
        setLoadingAnnouncements(true);
        setErrorAnnouncements(null);
        try {
            const response = await fetch('/api/announcements'); 
            const data = await response.json();
            
            if (response.ok) {
                setAnnouncements(data.announcements || []);
            } else {
                setErrorAnnouncements(data.message || 'Failed to load announcements.');
            }
        } catch (err) {
            console.error("Network error fetching announcements:", err);
            setErrorAnnouncements('Network error fetching announcements.');
        } finally {
            setLoadingAnnouncements(false);
        }
    }, []);

    const fetchEnrolledCourses = useCallback(async () => {
        setLoadingCourses(true);
        setErrorCourses(null);
        try {
            const response = await fetch('/api/student/courses');
            const data = await response.json();

            if (response.ok) {
                setEnrolledCourses(data.courses || []);
            } else {
                setErrorCourses(data.message || 'Failed to fetch enrolled courses.');
                setEnrolledCourses([]);
            }
        } catch (err) {
            console.error("Network error fetching courses:", err);
            setErrorCourses('Network error fetching courses. Check API server status.');
            setEnrolledCourses([]);
        } finally {
            setLoadingCourses(false);
        }
    }, []);

    useEffect(() => {
        if (!isSessionLoading) {
            fetchEnrolledCourses();
            fetchAnnouncements(); 
        }
    }, [isSessionLoading, fetchEnrolledCourses, fetchAnnouncements]); 

    const handleLogout = () => {
        signOut({ callbackUrl: '/' }); 
    };

    if (isSessionLoading) {
        return <p style={styles.loading}>Initializing session and loading dashboard...</p>;
    }


    return (
        <div style={styles.container}>
            
            <div style={styles.headerRow}>
                <div style={styles.brandingArea}> 
                    <LogoContainer /> 
                    <span style={styles.abbreviation}>LMS</span> 
                    <h1 style={styles.header}>Student Learning Hub & Status: {userName}</h1>
                </div>
                
                <button onClick={handleLogout} style={styles.logoutButton}>
                    Logout 🚪
                </button>
            </div>
            
            <p style={styles.subHeader}>Centralizing your courses, assessments, and communications.</p>
            
            {/* Tab Navigation (Responsive) */}
            <div style={styles.tabContainer}>
                <button 
                    onClick={() => setActiveTab('announcements')} 
                    style={activeTab === 'announcements' ? styles.activeTabButton : styles.tabButton}
                >
                    Announcements 📢
                </button>
                <button 
                    onClick={() => setActiveTab('courses')} 
                    style={activeTab === 'courses' ? styles.activeTabButton : styles.tabButton}
                >
                    My Courses 📚
                </button>
            </div>
            
            {/* Tab Content Area */}
            <div style={styles.contentArea}>
                {/* Render Announcements */}
                {activeTab === 'announcements' && (
                    <AnnouncementList 
                        announcements={announcements}
                        isLoading={loadingAnnouncements}
                        error={errorAnnouncements}
                    />
                )}

                {activeTab === 'courses' && (
                    <>
                        {(loadingCourses || isSessionLoading) && <p style={styles.loading}>Loading your course data...</p>}
                        {errorCourses && <p style={styles.error}>Error: {errorCourses}</p>}

                        {!loadingCourses && !errorCourses && enrolledCourses && (
                            <StudentCourseManager 
                                courses={enrolledCourses} 
                                fetchEnrolledCourses={fetchEnrolledCourses}
                                studentId={session?.user?.id}
                            />
                        )}
                        {!loadingCourses && !errorCourses && enrolledCourses?.length === 0 && (
                            <p style={styles.info}>You are not currently enrolled in any courses. Check available courses or contact an administrator.</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default withAuthGuard(StudentDashboard, [UserRole.STUDENT]);

// // pages/dashboard/student/index.js

// import React, { useState, useEffect, useCallback } from 'react';
// import { signOut, useSession } from 'next-auth/react'; 
// import { withAuthGuard } from '../../../components/AuthGuard';
// import { UserRole } from '@prisma/client';
// import LogoContainer from '../../../components/LogoContainer'; 
// import StudentCourseManager from '../../../components/StudentCourseManager';
// // 🔑 Re-using the AnnouncementList component
// import AnnouncementList from '../../../components/AnnouncementList'; 

// function StudentDashboard() {
//     const { data: session, status } = useSession();
//     const isSessionLoading = status === 'loading'; 

//     const userName = session?.user?.name || "Student"; 
    
//     const [enrolledCourses, setEnrolledCourses] = useState(null);
//     const [loadingCourses, setLoadingCourses] = useState(true);
//     const [errorCourses, setErrorCourses] = useState(null);
//     const [activeTab, setActiveTab] = useState('announcements'); // 🔑 Set initial tab to announcements
    
//     // 🔑 State for Announcements
//     const [announcements, setAnnouncements] = useState([]);
//     const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
//     const [errorAnnouncements, setErrorAnnouncements] = useState(null);

//     // 🔑 Function to fetch platform announcements
//     const fetchAnnouncements = useCallback(async () => {
//         setLoadingAnnouncements(true);
//         setErrorAnnouncements(null);
//         try {
//             // This API route is shared with the lecturer dashboard
//             const response = await fetch('/api/announcements'); 
//             const data = await response.json();
            
//             if (response.ok) {
//                 setAnnouncements(data.announcements || []);
//             } else {
//                 setErrorAnnouncements(data.message || 'Failed to load announcements.');
//             }
//         } catch (err) {
//             console.error("Network error fetching announcements:", err);
//             setErrorAnnouncements('Network error fetching announcements.');
//         } finally {
//             setLoadingAnnouncements(false);
//         }
//     }, []); // Empty dependency array as it doesn't depend on external props/state for API call

//     const fetchEnrolledCourses = useCallback(async () => {
//         setLoadingCourses(true);
//         setErrorCourses(null);
//         try {
//             const response = await fetch('/api/student/courses');
//             const data = await response.json();

//             if (response.ok) {
//                 setEnrolledCourses(data.courses || []);
//             } else {
//                 setErrorCourses(data.message || 'Failed to fetch enrolled courses.');
//                 setEnrolledCourses([]);
//             }
//         } catch (err) {
//             console.error("Network error fetching courses:", err);
//             setErrorCourses('Network error fetching courses. Check API server status.');
//             setEnrolledCourses([]);
//         } finally {
//             setLoadingCourses(false);
//         }
//     }, []);

//     useEffect(() => {
//         if (!isSessionLoading) {
//             fetchEnrolledCourses();
//             fetchAnnouncements(); // 🔑 Fetch announcements for students too
//         }
//     }, [isSessionLoading, fetchEnrolledCourses, fetchAnnouncements]); // Add fetchAnnouncements to dependencies

//     const handleLogout = () => {
//         signOut({ callbackUrl: '/' }); 
//     };

//     if (isSessionLoading) {
//         return <p style={styles.loading}>Initializing session and loading dashboard...</p>;
//     }


//     return (
//         <div style={styles.container}>
            
//             {/* Header, Branding, and Logout */}
//             <div style={styles.headerRow}>
//                 <div style={styles.brandingArea}> 
//                     <LogoContainer /> 
//                     <span style={styles.abbreviation}>LMS</span> 
//                     <h1 style={styles.header}>Student Learning Hub & Status: {userName}</h1>
//                 </div>
//                 <button onClick={handleLogout} style={styles.logoutButton}>
//                     Logout 🚪
//                 </button>
//             </div>
            
//             <p style={styles.subHeader}>Centralizing your courses, assessments, and communications.</p>
            
//             {/* Tab Navigation */}
//             <div style={styles.tabContainer}>
//                 {/* 🔑 Announcements Tab - generally good to show first */}
//                 <button 
//                     onClick={() => setActiveTab('announcements')} 
//                     style={activeTab === 'announcements' ? styles.activeTabButton : styles.tabButton}
//                 >
//                     Announcements 📢
//                 </button>
//                 <button 
//                     onClick={() => setActiveTab('courses')} 
//                     style={activeTab === 'courses' ? styles.activeTabButton : styles.tabButton}
//                 >
//                     My Courses 📚
//                 </button>
//             </div>
            
//             {/* Tab Content Area */}
//             <div style={styles.contentArea}>
//                 {/* 🔑 Render Announcements */}
//                 {activeTab === 'announcements' && (
//                     <AnnouncementList 
//                         announcements={announcements}
//                         isLoading={loadingAnnouncements}
//                         error={errorAnnouncements}
//                     />
//                 )}

//                 {activeTab === 'courses' && (
//                     <>
//                         {(loadingCourses || isSessionLoading) && <p style={styles.loading}>Loading your course data...</p>}
//                         {errorCourses && <p style={styles.error}>Error: {errorCourses}</p>}

//                         {!loadingCourses && !errorCourses && enrolledCourses && (
//                             <StudentCourseManager 
//                                 courses={enrolledCourses} 
//                                 fetchEnrolledCourses={fetchEnrolledCourses}
//                                 studentId={session?.user?.id} // 🔑 PASS THE STUDENT ID
//                             />
//                         )}
//                         {!loadingCourses && !errorCourses && enrolledCourses?.length === 0 && (
//                             <p style={styles.info}>You are not currently enrolled in any courses. Check available courses or contact an administrator.</p>
//                         )}
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// }

// // ----------------------------------------------------------------------
// // --- STYLES (Unchanged) ---
// // ----------------------------------------------------------------------

// const styles = {
//     container: { 
//         padding: '30px', 
//         maxWidth: '1200px', 
//         margin: 'auto', 
//         fontFamily: 'Arial, sans-serif' 
//     },
//     headerRow: { 
//         display: 'flex', 
//         justifyContent: 'space-between', 
//         alignItems: 'center', 
//         marginBottom: '10px' 
//     },
//     brandingArea: {
//         display: 'flex',
//         alignItems: 'center',
//     },
//     abbreviation: {
//         fontSize: '1.5em', 
//         fontWeight: '900',
//         color: '#4f46e5', 
//         marginRight: '15px',
//         marginLeft: '10px',
//         letterSpacing: '1px',
//         flexShrink: 0, 
//         lineHeight: '1', 
//         paddingTop: '2px', 
//     },
//     header: { 
//         fontSize: '2.2em', 
//         color: '#1f2937',
//         marginLeft: '10px',
//     },
//     logoutButton: {
//         padding: '10px 20px',
//         backgroundColor: '#ef4444', 
//         color: 'white',
//         border: 'none',
//         borderRadius: '6px',
//         cursor: 'pointer',
//         fontWeight: 'bold',
//         transition: 'background-color 0.2s',
//         fontSize: '1em'
//     },
//     subHeader: { 
//         color: '#4b5563', 
//         marginBottom: '40px', 
//         borderBottom: '1px solid #e5e7eb', 
//         paddingBottom: '15px' 
//     },
//     loading: { textAlign: 'center', padding: '20px', fontSize: '1.2em', color: '#3b82f6' },
//     error: { padding: '15px', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '4px', marginBottom: '20px' },
//     info: { padding: '20px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '4px', textAlign: 'center' },
    
//     tabContainer: { display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: '20px' },
//     tabButton: { 
//         padding: '10px 20px', 
//         border: 'none', 
//         backgroundColor: 'transparent', 
//         cursor: 'pointer', 
//         fontWeight: 'normal', 
//         fontSize: '1.1em',
//         color: '#6b7280',
//         borderBottom: '2px solid transparent',
//         transition: 'all 0.3s'
//     },
//     activeTabButton: {
//         padding: '10px 20px', 
//         border: 'none', 
//         backgroundColor: 'transparent', 
//         cursor: 'pointer', 
//         fontWeight: 'bold', 
//         fontSize: '1.1em',
//         color: '#4f46e5', 
//         borderBottom: '2px solid #4f46e5',
//     },
//     contentArea: {
//         padding: '10px',
//         backgroundColor: '#f9fafb',
//         borderRadius: '8px',
//         minHeight: '400px',
//     }
// };

// export default withAuthGuard(StudentDashboard, [UserRole.STUDENT]);