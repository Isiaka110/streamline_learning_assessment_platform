import React, { useState, useEffect } from 'react';

export default function EnrolledCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch('/api/student/courses');
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'Failed to load courses.');
                }
                const data = await res.json();
                setCourses(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) return <p>Loading courses...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;
    if (courses.length === 0) return <p>You are not currently enrolled in any courses.</p>;

    return (
        <div style={styles.courseGrid}>
            {courses.map(course => (
                <div key={course.id} style={styles.courseCard}>
                    <h3 style={styles.courseTitle}>{course.title} ({course.code})</h3>
                    <p style={styles.courseLecturer}>Taught by: {course.lecturerName}</p>
                    
                    {/* Progress Bar */}
                    <div style={styles.progressBarContainer}>
                        <div style={{ ...styles.progressBar, width: `${course.progress}%` }}></div>
                    </div>
                    <p style={styles.progressText}>
                        Progress: {course.progress}% ({course.completedSubmissions}/{course.totalAssignments} tasks)
                    </p>

                    <button style={styles.viewButton}>Go to Course</button>
                </div>
            ))}
        </div>
    );
}

const styles = {
    courseGrid: {
        display: 'grid',
        gap: '20px',
        marginTop: '15px',
    },
    courseCard: {
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        padding: '15px',
        backgroundColor: '#f9fafb',
    },
    courseTitle: {
        fontSize: '1.2em',
        fontWeight: 'bold',
        marginBottom: '5px',
    },
    courseLecturer: {
        color: '#6b7280',
        fontSize: '0.9em',
        marginBottom: '10px',
    },
    progressBarContainer: {
        height: '8px',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        marginBottom: '8px',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#3b82f6',
        borderRadius: '4px',
        transition: 'width 0.5s ease',
    },
    progressText: {
        fontSize: '0.85em',
        color: '#374151',
        marginBottom: '10px',
    },
    viewButton: {
        padding: '8px 12px',
        backgroundColor: '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    }
};