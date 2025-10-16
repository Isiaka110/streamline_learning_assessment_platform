import React, { useState, useEffect, useCallback } from 'react';
import { signOut, useSession } from 'next-auth/react'; 
import { withAuthGuard } from '../../components/AuthGuard';
import { UserRole } from '@prisma/client'; 
// Components
import AssignmentManager from '../../components/AssignmentManager';
import ResourceManager from '../../components/ResourceManager';
import LogoContainer from '../../components/LogoContainer';
import LecturerCommunication from '../../components/LecturerCommunication'; 
import AnnouncementList from '../../components/AnnouncementList'; 

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
    header: { 
        fontSize: isMobile ? '1.5em' : '2em', 
        color: '#1f2937',
        order: isMobile ? 3 : 2, 
        marginTop: isMobile ? '10px' : '0',
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
        marginBottom: '30px', 
        borderBottom: '1px solid #e5e7eb', 
        paddingBottom: '15px' 
    },
    brandingArea: { 
        display: 'flex', 
        alignItems: 'center', 
        order: isMobile ? 1 : 1, 
        marginBottom: isMobile ? '10px' : '0',
        width: isMobile ? '100%' : 'auto',
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
        display: isMobile ? 'none' : 'block',
    },
    
    // Course Selector: Stacks vertically on mobile and takes full width
    courseSelector: { 
        marginBottom: '25px', 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center', 
        gap: '15px', 
        padding: '15px', 
        backgroundColor: '#f3f4f6', 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px' 
    },
    selectorLabel: { fontWeight: 'bold', color: '#374151', fontSize: '1.1em' },
    selectInput: { 
        padding: '10px', 
        border: '1px solid #ccc', 
        borderRadius: '4px', 
        width: isMobile ? '100%' : '350px', 
        boxSizing: 'border-box',
        fontSize: '1em' 
    },

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
        flexShrink: 0, // Prevents buttons from shrinking
        border: 'none', 
        backgroundColor: 'transparent', 
        cursor: 'pointer', 
        fontWeight: 'normal', 
        fontSize: isMobile ? '0.9em' : '1.1em', 
        color: '#6b7280', 
        borderBottom: '2px solid transparent', 
        transition: 'all 0.3s',
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
    
    managerArea: { 
        padding: isMobile ? '0' : '10px',
        overflowWrap: 'break-word', 
    },
    
    // General styles 
    info: { padding: '20px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '4px', textAlign: 'center' },
});

function LecturerDashboard() {
    const { data: session } = useSession();
    const userName = session?.user?.name || "Lecturer"; 
    const lecturerId = session?.user?.id; 
    
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
    
    const [courses, setCourses] = useState(null);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [errorCourses, setErrorCourses] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null); 
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

    const fetchLecturerCourses = async () => {
        setLoadingCourses(true);
        setErrorCourses(null);
        try {
            const response = await fetch('/api/lecturer/courses'); 
            const data = await response.json();

            if (response.ok) {
                setCourses(data.courses);
                if (data.courses && data.courses.length > 0) {
                    setSelectedCourse(data.courses[0]); 
                }
            } else {
                setErrorCourses(data.message || 'Failed to fetch your courses.');
                setCourses([]);
            }
        } catch (err) {
            console.error("Network error fetching courses:", err);
            setErrorCourses('Network error fetching courses.');
            setCourses([]);
        } finally {
            setLoadingCourses(false);
        }
    };

    useEffect(() => {
        fetchLecturerCourses();
        fetchAnnouncements(); 
    }, [fetchAnnouncements]);

    const handleLogout = () => {
        signOut({ callbackUrl: '/' }); 
    };
    
    const handleCourseChange = (e) => {
        const courseId = e.target.value;
        const newCourse = courses.find(c => c.id === courseId);
        setSelectedCourse(newCourse);
    };

    const isCourseSelected = !!selectedCourse;

    return (
        <div style={styles.container}>
            
            <div style={styles.headerRow}>
                <div style={styles.brandingArea}> 
                    <LogoContainer/> 
                    {!isMobile && <span style={styles.abbreviation}>LMS</span>} 
                </div>
                
                <h1 style={styles.header}>Lecturer Control Panel: {userName}</h1> 
                
                <button onClick={handleLogout} style={styles.logoutButton}>
                    Logout 🚪
                </button>
            </div>
            
            <p style={styles.subHeader}>Manage assignments, course resources, and student communications.</p>
            
            {/* Course Selector */}
            <div style={styles.courseSelector}>
                <label htmlFor="course-select" style={styles.selectorLabel}>Currently Managing:</label>
                <select
                    id="course-select"
                    style={styles.selectInput}
                    value={selectedCourse?.id || ''}
                    onChange={handleCourseChange}
                    disabled={!courses || courses.length === 0 || loadingCourses}
                >
                    {loadingCourses && <option value="">Loading courses...</option>}
                    {!loadingCourses && courses?.length === 0 && <option value="">No courses assigned.</option>}
                    {!loadingCourses && courses?.length > 0 && courses.map(course => (
                        <option key={course.id} value={course.id}>
                            {course.code} - {course.title}
                        </option>
                    ))}
                </select>
            </div>

            {/* Tab Navigation (Responsive) */}
            <div style={styles.tabContainer}>
                <button 
                    onClick={() => setActiveTab('announcements')} 
                    style={activeTab === 'announcements' ? styles.activeTabButton : styles.tabButton}
                >
                    Announcements 📢
                </button>
                <button 
                    onClick={() => setActiveTab('assignments')} 
                    style={activeTab === 'assignments' ? styles.activeTabButton : styles.tabButton}
                    disabled={!isCourseSelected} 
                >
                    Assignment & Grading 📝
                </button>
                <button 
                    onClick={() => setActiveTab('resources')} 
                    style={activeTab === 'resources' ? styles.activeTabButton : styles.tabButton}
                    disabled={!isCourseSelected}
                >
                    Resource Management 📚
                </button>
                <button 
                    onClick={() => setActiveTab('communication')} 
                    style={activeTab === 'communication' ? styles.activeTabButton : styles.tabButton}
                    disabled={!isCourseSelected}
                >
                    Student Communication 💬
                </button>
            </div>
            
            {/* Manager Components */}
            <div style={styles.managerArea}>
                {activeTab === 'announcements' && (
                    <AnnouncementList 
                        announcements={announcements}
                        isLoading={loadingAnnouncements}
                        error={errorAnnouncements}
                    />
                )}
                
                {isCourseSelected && (
                    <>
                        {activeTab === 'assignments' && (
                            <AssignmentManager courseId={selectedCourse.id} courseCode={selectedCourse.code} />
                        )}
                        {activeTab === 'resources' && (
                            <ResourceManager courseId={selectedCourse.id} courseCode={selectedCourse.code} />
                        )}
                        {activeTab === 'communication' && (
                            <LecturerCommunication 
                                lecturerId={lecturerId} 
                                courseId={selectedCourse.id} 
                                courseCode={selectedCourse.code} 
                            />
                        )}
                    </>
                )}
                
                {!isCourseSelected && activeTab !== 'announcements' && courses?.length > 0 && (
                    <p style={styles.info}>Please select a course from the dropdown above to begin management.</p>
                )}
                {courses?.length === 0 && !loadingCourses && (
                    <p style={styles.info}>You have not been assigned any courses yet. Please contact an administrator.</p>
                )}

            </div>
        </div>
    );
}

export default withAuthGuard(LecturerDashboard, [UserRole.LECTURER]);



// // pages/dashboard/lecturer/index.js

// import React, { useState, useEffect, useCallback } from 'react';
// import { signOut, useSession } from 'next-auth/react'; 
// import { withAuthGuard } from '../../components/AuthGuard';
// import { UserRole } from '@prisma/client'; 
// // Components
// import AssignmentManager from '../../components/AssignmentManager';
// import ResourceManager from '../../components/ResourceManager';
// import LogoContainer from '../../components/LogoContainer';
// import LecturerCommunication from '../../components/LecturerCommunication'; 
// // 🔑 New component for announcements
// import AnnouncementList from '../../components/AnnouncementList'; 

// function LecturerDashboard() {
//     const { data: session } = useSession();
//     const userName = session?.user?.name || "Lecturer"; 
//     const lecturerId = session?.user?.id; 
    
//     const [courses, setCourses] = useState(null);
//     const [loadingCourses, setLoadingCourses] = useState(true);
//     const [errorCourses, setErrorCourses] = useState(null);
//     const [selectedCourse, setSelectedCourse] = useState(null); 
//     const [activeTab, setActiveTab] = useState('announcements'); // 🔑 Start on Announcements Tab
//     // 🔑 State for Announcements
//     const [announcements, setAnnouncements] = useState([]);
//     const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
//     const [errorAnnouncements, setErrorAnnouncements] = useState(null);
    
//     // 🔑 New function to fetch platform announcements
//     const fetchAnnouncements = useCallback(async () => {
//         setLoadingAnnouncements(true);
//         setErrorAnnouncements(null);
//         try {
//             // We'll create this API route next
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
//     }, []);

//     const fetchLecturerCourses = async () => {
//         setLoadingCourses(true);
//         setErrorCourses(null);
//         try {
//             const response = await fetch('/api/lecturer/courses'); 
//             const data = await response.json();

//             if (response.ok) {
//                 setCourses(data.courses);
//                 if (data.courses && data.courses.length > 0) {
//                     setSelectedCourse(data.courses[0]); 
//                 }
//             } else {
//                 setErrorCourses(data.message || 'Failed to fetch your courses.');
//                 setCourses([]);
//             }
//         } catch (err) {
//             console.error("Network error fetching courses:", err);
//             setErrorCourses('Network error fetching courses.');
//             setCourses([]);
//         } finally {
//             setLoadingCourses(false);
//         }
//     };

//     useEffect(() => {
//         fetchLecturerCourses();
//         fetchAnnouncements(); // 🔑 Fetch announcements on load
//     }, [fetchAnnouncements]);

//     const handleLogout = () => {
//         signOut({ callbackUrl: '/' }); 
//     };
    
//     const handleCourseChange = (e) => {
//         const courseId = e.target.value;
//         const newCourse = courses.find(c => c.id === courseId);
//         setSelectedCourse(newCourse);
//     };

//     const isCourseSelected = !!selectedCourse;

//     return (
//         <div style={styles.container}>
            
//             <div style={styles.headerRow}>
//                 <div style={styles.brandingArea}> 
//                     <LogoContainer/> <span style={styles.abbreviation}>LMS</span> 
//                 </div>
//                 <h1 style={styles.header}>Lecturer Control Panel: {userName}</h1> 
//                 <button onClick={handleLogout} style={styles.logoutButton}>
//                     Logout 🚪
//                 </button>
//             </div>
            
//             <p style={styles.subHeader}>Manage assignments, course resources, and student communications.</p>
            
//             {/* Course Selector */}
//             <div style={styles.courseSelector}>
//                 <label htmlFor="course-select" style={styles.selectorLabel}>Currently Managing:</label>
//                 <select
//                     id="course-select"
//                     style={styles.selectInput}
//                     value={selectedCourse?.id || ''}
//                     onChange={handleCourseChange}
//                     disabled={!courses || courses.length === 0 || loadingCourses}
//                 >
//                     {loadingCourses && <option value="">Loading courses...</option>}
//                     {!loadingCourses && courses?.length === 0 && <option value="">No courses assigned.</option>}
//                     {!loadingCourses && courses?.length > 0 && courses.map(course => (
//                         <option key={course.id} value={course.id}>
//                             {course.code} - {course.title}
//                         </option>
//                     ))}
//                 </select>
//             </div>

//             {/* Tab Navigation */}
//             <div style={styles.tabContainer}>
//                 {/* 🔑 Announcement Tab (Always available) */}
//                 <button 
//                     onClick={() => setActiveTab('announcements')} 
//                     style={activeTab === 'announcements' ? styles.activeTabButton : styles.tabButton}
//                 >
//                     Announcements 📢
//                 </button>
//                 <button 
//                     onClick={() => setActiveTab('assignments')} 
//                     style={activeTab === 'assignments' ? styles.activeTabButton : styles.tabButton}
//                     disabled={!isCourseSelected} 
//                 >
//                     Assignment & Grading 📝
//                 </button>
//                 <button 
//                     onClick={() => setActiveTab('resources')} 
//                     style={activeTab === 'resources' ? styles.activeTabButton : styles.tabButton}
//                     disabled={!isCourseSelected}
//                 >
//                     Resource Management 📚
//                 </button>
//                 <button 
//                     onClick={() => setActiveTab('communication')} 
//                     style={activeTab === 'communication' ? styles.activeTabButton : styles.tabButton}
//                     disabled={!isCourseSelected}
//                 >
//                     Student Communication 💬
//                 </button>
//             </div>
            
//             {/* Manager Components */}
//             <div style={styles.managerArea}>
//                 {activeTab === 'announcements' && (
//                     <AnnouncementList 
//                         announcements={announcements}
//                         isLoading={loadingAnnouncements}
//                         error={errorAnnouncements}
//                     />
//                 )}
                
//                 {isCourseSelected && (
//                     <>
//                         {activeTab === 'assignments' && (
//                             <AssignmentManager courseId={selectedCourse.id} courseCode={selectedCourse.code} />
//                         )}
//                         {activeTab === 'resources' && (
//                             <ResourceManager courseId={selectedCourse.id} courseCode={selectedCourse.code} />
//                         )}
//                         {activeTab === 'communication' && (
//                             <LecturerCommunication 
//                                 lecturerId={lecturerId} 
//                                 courseId={selectedCourse.id} 
//                                 courseCode={selectedCourse.code} 
//                             />
//                         )}
//                     </>
//                 )}
                
//                 {!isCourseSelected && activeTab !== 'announcements' && courses?.length > 0 && (
//                     <p style={styles.info}>Please select a course from the dropdown above to begin management.</p>
//                 )}
//                 {courses?.length === 0 && !loadingCourses && (
//                     <p style={styles.info}>You have not been assigned any courses yet. Please contact an administrator.</p>
//                 )}

//             </div>
//         </div>
//     );
// }

// // ----------------------------------------------------------------------
// // --- STYLES ---
// // ----------------------------------------------------------------------

// const styles = {
//     container: { padding: '30px', maxWidth: '1200px', margin: 'auto', fontFamily: 'Arial, sans-serif' },
//     headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
//     header: { fontSize: '2em', color: '#1f2937' },
//     logoutButton: { padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.2s', fontSize: '1em' },
//     subHeader: { color: '#4b5563', marginBottom: '30px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px' },
//     loading: { textAlign: 'center', padding: '20px', fontSize: '1.2em', color: '#3b82f6' },
//     error: { padding: '15px', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '4px', marginBottom: '20px' },
//     info: { padding: '20px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '4px', textAlign: 'center' },

//     brandingArea: { display: 'flex', alignItems: 'center' },
//     abbreviation: { fontSize: '1.5em', fontWeight: '900', color: '#4f46e5', marginRight: '15px', marginLeft: '10px', letterSpacing: '1px', flexShrink: 0, lineHeight: '1', paddingTop: '2px' },
    
//     courseSelector: { marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px' },
//     selectorLabel: { fontWeight: 'bold', color: '#374151', fontSize: '1.1em' },
//     selectInput: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', minWidth: '350px', fontSize: '1em' },

//     tabContainer: { display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: '20px' },
//     tabButton: { 
//         padding: '10px 20px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 'normal', fontSize: '1.1em', color: '#6b7280', borderBottom: '2px solid transparent', transition: 'all 0.3s'
//     },
//     activeTabButton: {
//         padding: '10px 20px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1em', color: '#4f46e5', borderBottom: '2px solid #4f46e5',
//     },
//     managerArea: { padding: '10px' }
// };

// export default withAuthGuard(LecturerDashboard, [UserRole.LECTURER]);

