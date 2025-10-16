// components/StudentCourseManager.js

import React, { useState, useEffect } from 'react';
import CourseEnrollmentList from './CourseEnrollmentList';
import CourseCommentThread from './CourseCommentThread'; 
import StudentAssignmentView from './StudentAssignmentView'; 
import StudentResourceView from './StudentResourceView';

/**
 * Manages the student's enrolled course list and the detail view for a selected course.
 * @param {Array} courses - List of courses the student is enrolled in.
 * @param {Function} fetchEnrolledCourses - Function to refresh the main course list.
 * @param {string} studentId - The ID of the currently logged-in student.
 */
function StudentCourseManager({ courses, fetchEnrolledCourses, studentId }) { 
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [view, setView] = useState('my_courses'); // my_courses (list), enrollment_list, course_detail

    // For course_detail view, manage sub-tabs
    const [detailTab, setDetailTab] = useState('assignments'); // assignments, resources, communication

    const handleEnrollmentSuccess = () => {
        setView('my_courses');
        if (fetchEnrolledCourses) {
            fetchEnrolledCourses();
        }
    };

    // --- RENDER COURSE DETAIL VIEW ---
    if (selectedCourse && view === 'course_detail') { 
        // Assuming lecturerId and lecturerName are populated in the selectedCourse object
        const lecturerId = selectedCourse.lecturers?.[0]?.id; // Get the ID of the first lecturer, assuming one for simplicity here
        const lecturerNameDetail = selectedCourse.lecturers?.[0]?.name || 'N/A';

        return (
            <div style={styles.detailContainer}>
                <button onClick={() => { setSelectedCourse(null); setView('my_courses'); }} style={styles.backButton}>
                    &larr; Back to My Courses
                </button>
                <h3 style={styles.detailHeader}>{selectedCourse.code} - {selectedCourse.title}</h3> 
                <p style={styles.lecturerInfo}>Lecturer: {lecturerNameDetail}</p>
                
                {/* Tabs for Course Details */}
                <div style={styles.detailTabContainer}>
                    <button 
                        onClick={() => setDetailTab('assignments')} 
                        style={detailTab === 'assignments' ? styles.activeDetailTabButton : styles.detailTabButton}
                    >
                        Assignments & Grades 📝
                    </button>
                    <button 
                        onClick={() => setDetailTab('resources')} 
                        style={detailTab === 'resources' ? styles.activeDetailTabButton : styles.detailTabButton}
                    >
                        Course Resources 📚
                    </button>
                    <button 
                        onClick={() => setDetailTab('communication')} 
                        style={detailTab === 'communication' ? styles.activeDetailTabButton : styles.detailTabButton}
                    >
                        Communication 💬
                    </button>
                </div>

                {/* Content based on detailTab */}
                <div style={styles.sectionCard}>
                    {detailTab === 'assignments' && (
                        <StudentAssignmentView 
                            courseId={selectedCourse.id}
                            studentId={studentId}
                        />
                    )}
                    {detailTab === 'resources' && (
                        <StudentResourceView
                            courseId={selectedCourse.id}
                        />
                    )}
                    {detailTab === 'communication' && (
                        <>
                            <h4 style={styles.sectionHeader}>Direct Communication / Course Feedback</h4>
                            {lecturerId ? ( // Only show communication if a lecturer ID is available
                                <CourseCommentThread 
                                    courseId={selectedCourse.id}
                                    currentUserId={studentId} 
                                    otherUserId={lecturerId} 
                                />
                            ) : (
                                <p style={styles.info}>No lecturer assigned for direct communication in this course.</p>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    }
    
    // --- RENDER ENROLLMENT LIST VIEW ---
    if (view === 'enrollment_list') {
        return (
            <div style={styles.listContainer}>
                <button onClick={() => setView('my_courses')} style={styles.backButton}>
                    &larr; Back to My Courses
                </button>
                <CourseEnrollmentList 
                    enrolledCourses={courses}
                    onEnrollSuccess={handleEnrollmentSuccess}
                />
            </div>
        );
    }

    // --- RENDER MY COURSES LIST VIEW (Default) ---
    return (
        <div style={styles.listContainer}>
            <div style={styles.listHeaderRow}>
                <h3 style={styles.listHeader}>Your Enrolled Courses ({courses?.length || 0})</h3>
                <div style={styles.actionButtons}>
                    <button 
                        onClick={() => setView('enrollment_list')} 
                        style={styles.enrollButton}
                    >
                        + Enroll in New Course
                    </button>
                </div>
            </div>
            
            <div style={styles.courseGrid}>
                {courses && courses.length > 0 ? (
                    courses.map(course => {
                        // Assuming the course object will have a 'lecturers' array
                        const lecturerNameCard = course.lecturers?.[0]?.name || 'N/A';
                        
                        return (
                            <div 
                                key={course.id} 
                                style={styles.courseCard} 
                                onClick={() => { setSelectedCourse(course); setView('course_detail'); }}
                            >
                                <h4 style={styles.courseTitle}>{course.code}: {course.title}</h4>
                                <p style={styles.courseDetail}>Lecturer: {lecturerNameCard}</p>
                                <button style={styles.viewButton}>View Course Details & Work</button>
                            </div>
                        );
                    })
                ) : (
                    <div style={styles.info}>
                        You are not currently enrolled in any courses. Click "+ Enroll in New Course" to get started!
                    </div>
                )}
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// --- STYLES ---
// ----------------------------------------------------------------------

const styles = {
    listContainer: { padding: '15px' },
    listHeaderRow: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: '1px solid #ddd', 
        paddingBottom: '10px', 
        marginBottom: '20px' 
    },
    listHeader: { fontSize: '1.5em', color: '#1f2937' },
    actionButtons: { display: 'flex', gap: '10px' },
    enrollButton: {
        padding: '10px 15px', 
        backgroundColor: '#10b981', 
        color: 'white', 
        border: 'none', 
        borderRadius: '6px', 
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
        // In a real app, you'd use a CSS module or styled-components for hover effects
    },
    courseGrid: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '20px' 
    },
    courseCard: { 
        padding: '20px', 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        transition: 'box-shadow 0.2s, transform 0.1s', 
        backgroundColor: '#fff', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        // Hover effects would be here
    },
    courseTitle: { fontSize: '1.2em', marginBottom: '10px', color: '#1f2937' },
    courseDetail: { fontSize: '0.9em', color: '#6b7280', marginBottom: '5px' },
    viewButton: { 
        marginTop: '15px', 
        padding: '8px 15px', 
        backgroundColor: '#4f46e5', 
        color: 'white', 
        border: 'none', 
        borderRadius: '4px', 
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        // Hover effects would be here
    },
    info: { 
        padding: '20px', 
        backgroundColor: '#eff6ff', 
        color: '#1d4ed8', 
        border: '1px solid #bfdbfe', 
        borderRadius: '4px', 
        textAlign: 'center',
        gridColumn: '1 / -1'
    },
    detailContainer: { padding: '15px' },
    backButton: { 
        marginBottom: '20px', 
        padding: '8px 15px', 
        backgroundColor: '#e5e7eb', 
        border: 'none', 
        borderRadius: '4px', 
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        // Hover effects would be here
    },
    detailHeader: { fontSize: '1.8em', marginBottom: '10px', color: '#1f2937' },
    lecturerInfo: { color: '#4b5563', marginBottom: '20px', fontSize: '1.1em' },
    sectionCard: { 
        border: '1px solid #e5e7eb', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px', 
        backgroundColor: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    sectionHeader: { 
        fontSize: '1.3em', 
        marginBottom: '15px', 
        color: '#374151',
        borderBottom: '1px solid #eee',
        paddingBottom: '10px'
    },
    detailTabContainer: { display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: '20px' },
    detailTabButton: { 
        padding: '10px 20px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 'normal', fontSize: '1em', color: '#6b7280', borderBottom: '2px solid transparent', transition: 'all 0.3s'
    },
    activeDetailTabButton: {
        padding: '10px 20px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 'bold', fontSize: '1em', color: '#4f46e5', borderBottom: '2px solid #4f46e5',
    },
};

export default StudentCourseManager;