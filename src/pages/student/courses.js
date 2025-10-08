// pages/student/courses.js

import React, { useState, useEffect } from 'react';
import { withAuthGuard } from '../../components/AuthGuard';
import { UserRole } from '@prisma/client';

// Component to handle the enrollment button and logic
const EnrollButton = ({ courseId, isEnrolled, onEnroll }) => {
  const [loading, setLoading] = useState(false);

  const handleEnroll = async () => {
    setLoading(true);
    try {
      // Call the enrollment API
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message); // Show success message
        onEnroll(courseId); // Update the state in the parent component
      } else {
        alert(`Enrollment failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Enrollment network error:', error);
      alert('An unexpected error occurred during enrollment.');
    } finally {
      setLoading(false);
    }
  };

  if (isEnrolled) {
    return <button disabled style={styles.enrolledButton}>Enrolled ✅</button>;
  }

  return (
    <button onClick={handleEnroll} disabled={loading} style={styles.enrollButton}>
      {loading ? 'Processing...' : 'Enroll Now'}
    </button>
  );
};


function StudentCoursesBrowser() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set()); // Track enrolled courses

  // Dummy fetch for initial enrolled status (You'll replace this with a real API later)
  const fetchInitialData = async () => {
    // NOTE: In a complete solution, you would have a GET /api/enrollments/my route
    // that returns all course IDs the student is currently enrolled in.
    // For now, let's just fetch all available courses.
    try {
      // Fetch all courses
      const courseResponse = await fetch('/api/courses');
      if (!courseResponse.ok) throw new Error('Failed to fetch courses list.');
      const courseData = await courseResponse.json();
      
      // OPTIONAL: Fetch user's current enrollments (for now, assume none)
      // const enrollmentResponse = await fetch('/api/enrollments/my'); 
      // ... process enrollment data and populate setEnrolledCourseIds ...
      
      setCourses(courseData.courses);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);
  
  // Update local state when a successful enrollment occurs
  const handleSuccessfulEnrollment = (courseId) => {
    setEnrolledCourseIds(prev => new Set(prev).add(courseId));
  };


  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading available courses...</p>;
  if (error) return <p style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>Error: {error}</p>;

  return (
    <div style={styles.pageContainer}>
      <h1>Available Courses 📚</h1>
      <p>Select a course to enroll and begin your learning journey.</p>
      
      <div style={styles.gridContainer}>
        {courses.length === 0 ? (
          <p>No courses are currently available for enrollment.</p>
        ) : (
          courses.map(course => (
            <div key={course.id} style={styles.courseCard}>
              <h3>{course.title} ({course.code})</h3>
              <p style={styles.lecturerText}>Taught by: **{course.lecturer?.name || 'Unknown Lecturer'}**</p>
              <p>{course.description || 'No description provided.'}</p>
              <EnrollButton 
                courseId={course.id}
                isEnrolled={enrolledCourseIds.has(course.id)}
                onEnroll={handleSuccessfulEnrollment}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Protect the route: Only STUDENTs are allowed access
export default withAuthGuard(StudentCoursesBrowser, [UserRole.STUDENT]);


// Simple internal styles (use actual CSS/Tailwind for production)
const styles = {
  pageContainer: {
    padding: '20px',
    maxWidth: '1000px',
    margin: 'auto',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  courseCard: {
    padding: '20px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
  },
  lecturerText: {
    fontSize: '0.9em',
    color: '#555',
    marginBottom: '10px',
    fontStyle: 'italic',
  },
  enrollButton: {
    marginTop: '15px',
    padding: '10px 15px',
    backgroundColor: '#10b981', // Tailwind green-500
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s',
  },
  enrolledButton: {
    marginTop: '15px',
    padding: '10px 15px',
    backgroundColor: '#ccc',
    color: '#333',
    border: 'none',
    borderRadius: '4px',
    cursor: 'default',
    fontSize: '16px',
  }
};