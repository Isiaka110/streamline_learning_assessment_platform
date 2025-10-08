// pages/lecturer/dashboard.js

import React, { useState, useEffect } from 'react';
import { withAuthGuard } from '../../components/AuthGuard';
import { UserRole } from '@prisma/client'; 
import CourseCreationForm from '../../components/CourseCreationForm';
import AssignmentCreationForm from '../../components/AssignmentCreationForm'; // New Import
import ResourceUploadForm from '../../components/ResourceUploadForm'; // <--- New Import

function LecturerDashboard() {
  const [courses, setCourses] = useState(null);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [errorCourses, setErrorCourses] = useState(null);

  // Function to fetch the lecturer's courses using the updated API logic
  const fetchLecturerCourses = async () => {
    setLoadingCourses(true);
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();

      if (response.ok) {
        setCourses(data.courses);
        setErrorCourses(null);
      } else {
        setErrorCourses(data.message || 'Failed to fetch your courses.');
        setCourses([]); // Set to empty array on fetch error
      }
    } catch (err) {
      setErrorCourses('Network error fetching courses.');
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchLecturerCourses();
  }, []); // Run only once on mount

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: 'auto' }}>
      <h1>Lecturer Dashboard 📊</h1>
      <p>Welcome, Lecturer! Manage your courses and assignments here.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '30px' }}>
        {/* LEFT COLUMN: Course Creation */}
        <div>
            <h2>Create New Course ➕</h2>
            {/* NOTE: You might want to pass fetchLecturerCourses to CourseCreationForm 
            so it can refresh the list after a new course is made. */}
            <CourseCreationForm />
        </div>

        {/* RIGHT COLUMN: Assignment Creation */}
        <div>
            <h2>Create New Assignment 📝</h2>
            {loadingCourses && <p>Loading your courses...</p>}
            {errorCourses && <p style={{color: 'red'}}>Error: {errorCourses}</p>}
            
            {!loadingCourses && !errorCourses && (
                <AssignmentCreationForm lecturerCourses={courses} />
                
            )}
        </div>
    {/* 3. Resource Upload (NEW SECTION) */}
      <div>
          <h2>Upload Course Resources 📚</h2>
          {/* Inject the new component here: */}
          <ResourceUploadForm lecturerCourses={courses} /> 
      </div>
      </div>
      
    </div>
  );
}

// Protect the route: Only LECTURERs and ADMINs are allowed access
export default withAuthGuard(LecturerDashboard, [UserRole.LECTURER, UserRole.ADMIN]);