import React, { useState, useEffect, useCallback } from 'react';

/**
 * Renders a list of all available courses, filtering out those the student is already enrolled in.
 * @param {Array} enrolledCourses - Courses the student is currently enrolled in (used for filtering).
 * @param {Function} onEnrollSuccess - Callback to refresh the parent list and switch view on success.
 */
function CourseEnrollmentList({ enrolledCourses, onEnrollSuccess }) {
    const [availableCourses, setAvailableCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Use a single status object to track enrollment state per course
    const [enrollStatus, setEnrollStatus] = useState({}); 

    // Convert the prop array into a stable set of IDs for quick lookups and filtering
    const enrolledCourseIds = new Set(enrolledCourses ? enrolledCourses.map(c => c.id) : []);

    /**
     * Fetches ALL available courses from the system.
     * 🔑 FIX: Memoize function for stable dependency in useEffect.
     */
    const fetchAvailableCourses = useCallback(async () => {
        // Only show loading for the entire component on the initial fetch
        if (availableCourses.length === 0) {
            setLoading(true);
        }
        setError(null);
        try {
            const response = await fetch('/api/courses/all'); 
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to load available courses.');
            }
            
            // 🔑 FIX: Filter using the stable Set of IDs
            const filteredCourses = (data.courses || []).filter(
                course => !enrolledCourseIds.has(course.id)
            );
            
            setAvailableCourses(filteredCourses);
        } catch (err) {
            console.error("Network error fetching available courses:", err);
            setError(err.message || 'Network error: Could not fetch course catalog.');
        } finally {
            setLoading(false);
        }
    }, [enrolledCourseIds]); // Dependency on the Set of IDs

    useEffect(() => {
        fetchAvailableCourses();
    }, [fetchAvailableCourses]);

    /**
     * Handles the enrollment POST request to the server.
     */
    const handleEnroll = async (courseId, courseTitle) => {
        if (!window.confirm(`Are you sure you want to enroll in "${courseTitle}"?`)) {
            return;
        }

        // 1. Set status to loading for THIS specific course button
        setEnrollStatus(prev => ({ ...prev, [courseId]: 'loading' }));
        
        try {
            const response = await fetch('/api/student/enrollment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId }),
            });
            
            const data = await response.json();

            if (response.ok) {
                alert(data.message || `${courseTitle} enrolled successfully!`);
                
                // 2. SUCCESS: Remove the course immediately from the AVAILABLE list
                setAvailableCourses(prev => prev.filter(c => c.id !== courseId));
                
                // 3. Trigger parent refresh and view switch (this is key to fixing the glitch)
                onEnrollSuccess(); 
                
            } else {
                // 4. ERROR: Set status to error and keep the course in the list
                alert(`Enrollment Error: ${data.message || 'Failed to enroll.'}`);
                setEnrollStatus(prev => ({ ...prev, [courseId]: 'error' }));
            }
        } catch (err) {
            console.error("Enrollment network error:", err);
            alert('A network error occurred during enrollment.');
            setEnrollStatus(prev => ({ ...prev, [courseId]: 'error' }));
        }
    };


    if (loading) return <p style={styles.loading}>Loading course catalog...</p>;
    if (error) return <p style={styles.error}>Error: {error}</p>;

    return (
        <div style={styles.container}>
            <h3 style={styles.header}>Available Courses for Enrollment</h3>
            {availableCourses.length === 0 ? (
                <p style={styles.info}>
                    {/* Check if no courses available OR if the current filter removed everything */}
                    {enrolledCourseIds.size > 0 && availableCourses.length === 0 
                        ? 'All available courses are currently enrolled.'
                        : 'No courses are currently available in the catalog.'
                    }
                </p>
            ) : (
                <div style={styles.courseList}>
                    {availableCourses.map(course => (
                        <div key={course.id} style={styles.courseCard}>
                            <div style={styles.textGroup}>
                                <h4 style={styles.courseTitle}>{course.title} ({course.code})</h4>
                                <p style={styles.courseDetail}>{course.description || 'No description available.'}</p>
                            </div>
                            <button 
                                onClick={() => handleEnroll(course.id, course.title)}
                                style={styles.enrollButton}
                                // Disable button while loading or if it's in an error state
                                disabled={enrollStatus[course.id] === 'loading'}
                            >
                                {enrollStatus[course.id] === 'loading' ? 'Processing...' : 
                                 enrollStatus[course.id] === 'error' ? 'Try Again' : 'Enroll Now'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ----------------------------------------------------------------------
// --- STYLES (Keep existing styles) ---
// ----------------------------------------------------------------------
const styles = {
    container: { padding: '15px' },
    header: { fontSize: '1.6em', marginBottom: '20px', color: '#1f2937' },
    loading: { textAlign: 'center', padding: '20px', fontSize: '1.2em', color: '#3b82f6' },
    error: { padding: '15px', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '4px', marginBottom: '20px' },
    info: { padding: '20px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '4px', textAlign: 'center' },
    courseList: { display: 'flex', flexDirection: 'column', gap: '10px' },
    courseCard: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '15px', 
        border: '1px solid #e5e7eb', 
        borderRadius: '6px', 
        backgroundColor: '#fff' 
    },
    textGroup: { flexGrow: 1, marginRight: '15px' },
    courseTitle: { fontSize: '1.1em', marginBottom: '5px', color: '#1f2937' },
    courseDetail: { fontSize: '0.9em', color: '#6b7280' },
    enrollButton: {
        padding: '10px 20px', 
        backgroundColor: '#4f46e5',
        color: 'white', 
        border: 'none', 
        borderRadius: '6px', 
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
        minWidth: '120px',
        '&:hover': { backgroundColor: '#4338ca' },
        '&:disabled': { backgroundColor: '#9ca3af', cursor: 'not-allowed' }
    }
};

export default CourseEnrollmentList;