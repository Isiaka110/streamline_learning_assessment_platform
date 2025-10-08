// pages/student/resources.js

import React, { useState, useEffect } from 'react';
import { withAuthGuard } from '../../components/AuthGuard';
import { UserRole } from '@prisma/client';

function StudentResourcesView() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResources = async () => {
    setLoading(true);
    try {
      // Call the student's personal resources API
      const response = await fetch('/api/resources/my');
      const data = await response.json();

      if (response.ok) {
        setResources(data.resources);
      } else {
        setError(data.message || 'Failed to fetch course resources.');
      }
    } catch (err) {
      setError('Network error fetching resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  if (loading) return <p style={styles.message}>Loading your course resources...</p>;
  if (error) return <p style={{...styles.message, color: 'red'}}>Error: {error}</p>;

  return (
    <div style={styles.pageContainer}>
      <h1>Course Resources & Files 📂</h1>
      <p style={styles.introText}>Access the slides, readings, and materials shared by your lecturers.</p>
      
      {resources.length === 0 ? (
        <p style={styles.noData}>You are currently not enrolled in any courses with shared resources.</p>
      ) : (
        <div style={styles.listContainer}>
          {resources.map(resource => {
            const course = resource.course;
            
            // Extract file extension for display purposes
            const extension = resource.filePath.split('.').pop().toUpperCase();
            
            return (
              <div key={resource.id} style={styles.resourceItem}>
                
                <div style={styles.fileIcon}>
                    {/* Simple icon based on file type */}
                    {extension === 'PDF' && '📄'} 
                    {extension === 'PPTX' && '💡'} 
                    {extension !== 'PDF' && extension !== 'PPTX' && '📎'}
                </div>
                
                <div style={styles.details}>
                    <h3 style={styles.title}>{resource.title}</h3>
                    <p style={styles.courseInfo}>{course.code}: {course.title} | {course.lecturer.name}</p>
                    <p style={styles.uploadInfo}>Uploaded: {new Date(resource.uploadedAt).toLocaleDateString()}</p>
                </div>

                <a 
                    href={resource.filePath} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={styles.downloadButton}
                    // The browser will handle downloading since the file is publicly accessible via /public/submissions
                >
                    Download ({extension})
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Protect the route: Only STUDENTs are allowed access
export default withAuthGuard(StudentResourcesView, [UserRole.STUDENT]);

// Simple internal styles
const styles = {
    pageContainer: { padding: '20px', maxWidth: '900px', margin: 'auto' },
    introText: { marginBottom: '30px', color: '#555' },
    listContainer: { display: 'flex', flexDirection: 'column', gap: '15px' },
    resourceItem: { 
        display: 'flex', 
        alignItems: 'center', 
        padding: '15px', 
        border: '1px solid #e0e0e0', 
        borderRadius: '6px', 
        backgroundColor: 'white', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    fileIcon: { 
        fontSize: '2.5em', 
        marginRight: '20px', 
        minWidth: '40px',
        textAlign: 'center'
    },
    details: { 
        flexGrow: 1 
    },
    title: { 
        marginTop: 0, 
        marginBottom: '5px', 
        fontSize: '1.2em', 
        color: '#0070f3' 
    },
    courseInfo: { 
        fontSize: '0.9em', 
        color: '#777', 
        marginBottom: '3px' 
    },
    uploadInfo: { 
        fontSize: '0.8em', 
        color: '#999' 
    },
    downloadButton: { 
        padding: '8px 15px', 
        backgroundColor: '#10b981', 
        color: 'white', 
        textDecoration: 'none', 
        borderRadius: '4px', 
        fontWeight: 'bold',
        fontSize: '0.9em',
        marginLeft: '15px'
    },
    message: { textAlign: 'center', marginTop: '50px' },
    noData: { textAlign: 'center', padding: '30px', backgroundColor: '#f0f0f0', borderRadius: '6px' }
};