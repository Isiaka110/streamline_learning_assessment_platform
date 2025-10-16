import React, { useState, useEffect } from 'react';
import { withAuthGuard } from '../../../../components/AuthGuard';
import { UserRole } from '@prisma/client';
import AdminCourseTable from '../../../../components/AdminCourseTable';
import CourseFormModal from '../../../../components/CourseFormModal';
import LogoContainer from '../../../../components/LogoContainer';

function AdminCourseManagement() {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCourse, setCurrentCourse] = useState(null); 
    const [message, setMessage] = useState(''); 

    // --- Data Fetching Logic ---
    const fetchCourses = async () => {
        setIsLoading(true);
        setError(null);
        setMessage('');
        try {
            const res = await fetch('/api/admin/courses'); 
            const data = await res.json();

            if (res.ok) {
                if (Array.isArray(data)) {
                    setCourses(data);
                    setMessage('Course list refreshed successfully.');
                } else {
                    console.error("API response for courses was not an array:", data);
                    setError("Received unexpected data format from the server.");
                    setCourses([]);
                }
            } else {
                setError(data.message || 'Failed to load course data.');
            }
        } catch (err) {
            console.error("Fetch Courses Network Error:", err);
            setError('Network error while fetching courses. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    // --- Event Handlers ---

    // Opens the modal for creating a new course
    const handleCreateNew = () => {
        setCurrentCourse(null); // Set to null for creation mode
        setIsModalOpen(true);
        setMessage('');
        setError(null);
    };

    // Opens the modal for editing an existing course
    const handleEdit = (course) => {
        setMessage('');
        setError(null);
        
        if (!course || !course.id) {
            const missingIdError = '🚨 Cannot edit: Course ID is missing. Check AdminCourseTable data.';
            setError(missingIdError);
            console.error('Edit failed:', missingIdError, course);
            return;
        }
        
        setCurrentCourse(course); // Set the course data
        setIsModalOpen(true);
    };
    
    // Handles what happens after the modal is successfully submitted
    const handleSuccess = (success) => {
        setIsModalOpen(false);
        if (success) {
             // Refresh the list and show a success message
            fetchCourses();
            setMessage(currentCourse ? 'Course updated successfully!' : 'Course created successfully!');
        }
    };

    // Handles deleting a course
    const handleDelete = async (courseId) => {
        if (!courseId) {
            setError('Cannot delete: Course ID is missing.');
            return;
        }

        if (typeof window !== 'undefined') {
            const confirmed = prompt(`Type 'DELETE' to confirm you want to delete course ID ${courseId}. This action is permanent.`);
            if (confirmed !== 'DELETE') {
                return;
            }
        }
        
        setError(null);
        setMessage('');
        
        try {
            const res = await fetch(`/api/admin/courses/${courseId}`, { 
                method: 'DELETE' 
            });
            
            if (res.ok) {
                setCourses(prevCourses => 
                    prevCourses.filter(c => c.id !== courseId)
                );
                setMessage('Course successfully deleted.');
            } else {
                const data = await res.json();
                const errorMessage = data.message || `Failed to delete course. Status: ${res.status}`;
                setError(errorMessage);
            }
        } catch (err) {
            console.error("Deletion network error:", err);
            setError('Network error during deletion.');
        }
    };

    return (
        <div style={styles.container}>
            <LogoContainer />
            <h1 style={styles.header}>Admin Course Management</h1>
            <p style={styles.description}>Manage all academic courses, including assignment of lecturers and details.</p>

            <div style={styles.controls}>
                <button 
                    onClick={handleCreateNew} 
                    style={styles.createButton}
                    disabled={isLoading}
                >
                    + Create New Course
                </button>
            </div>
            
            {message && <p style={styles.successMessage}>{message}</p>}
            {error && <p style={styles.errorMessage}>❌ Error: {error}</p>}
            
            <AdminCourseTable 
                courses={courses} 
                isLoading={isLoading} 
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {isModalOpen && (
                <CourseFormModal 
                    course={currentCourse}
                    // Pass handleSuccess to fetch new data after a successful save/update
                    onSuccess={handleSuccess} 
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}

// Basic Inline Styles (for context)
const styles = {
    container: { padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' },
    header: { fontSize: '2.5rem', color: '#1f2937', marginBottom: '10px' },
    description: { fontSize: '1rem', color: '#4b5563', marginBottom: '30px' },
    controls: { display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' },
    createButton: { padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    successMessage: { padding: '10px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '4px', marginBottom: '15px' },
    errorMessage: { padding: '10px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '4px', marginBottom: '15px' }
};

export default withAuthGuard(AdminCourseManagement, [UserRole.ADMIN]);


// // pages/dashboard/admin/course-management/index.js

// import React, { useState, useEffect } from 'react';
// import { withAuthGuard } from '../../../../components/AuthGuard';
// import { UserRole } from '@prisma/client';
// import AdminCourseTable from '../../../../components/AdminCourseTable'; // Assuming you have this table component
// import CourseFormModal from '../../../../components/CourseFormModal'; // The modal we just refined
// import LogoContainer from '../../../../components/LogoContainer';

// function AdminCourseManagement() {
//     const [courses, setCourses] = useState([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [currentCourse, setCurrentCourse] = useState(null); // Course being edited, or null for creation

//     // --- Data Fetching Logic ---
//     const fetchCourses = async () => {
//         setIsLoading(true);
//         setError(null);
//         try {
//             const res = await fetch('/api/admin/courses'); // GET all courses
//             const data = await res.json();

//             if (res.ok) {
//                 if (Array.isArray(data)) {
//                     setCourses(data);
//                 } else {
//                     console.error("API response for courses was not an array:", data);
//                     setError("Received unexpected data format from the server.");
//                     setCourses([]);
//                 }
//             } else {
//                 setError(data.message || 'Failed to load course data.');
//             }
//         } catch (err) {
//             console.error("Fetch Courses Network Error:", err);
//             setError('Network error while fetching courses. Please check your connection.');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchCourses();
//     }, []);

//     // --- Event Handlers ---

//     // Opens the modal for creating a new course
//     const handleCreateNew = () => {
//         setCurrentCourse(null); // Clear any previous course data
//         setIsModalOpen(true);
//     };

//     // Opens the modal for editing an existing course
//     const handleEdit = (course) => {
//         setCurrentCourse(course); // Set the course data to populate the modal form
//         setIsModalOpen(true);
//     };

//     // Handles deleting a course
//     const handleDelete = async (courseId) => {
//         if (!window.confirm("Are you sure you want to delete this course? This action is permanent.")) {
//             return;
//         }
        
//         setError(null);
        
//         try {
//             // DELETE request to the dynamic ID endpoint
//             const res = await fetch(`/api/admin/courses/${courseId}`, { 
//                 method: 'DELETE' 
//             });
            
//             if (res.ok) {
//                 setCourses(prevCourses => 
//                     prevCourses.filter(c => c.id !== courseId)
//                 );
//                 alert('✅ Course successfully deleted.');
//             } else {
//                 const data = await res.json();
//                 setError(data.message || `Failed to delete course. Status: ${res.status}`);
//                 alert(`❌ Error deleting course: ${data.message || 'Deletion failed on the server.'}`);
//             }
//         } catch (err) {
//             console.error("Deletion network error:", err);
//             setError('Network error during deletion. Please check your connection.');
//             alert('❌ Network error during deletion. Check your connection.');
//         }
//     };

//     // Closes the modal and refreshes data if a successful operation occurred
//     const handleModalClose = (wasSuccessful) => {
//         setIsModalOpen(false);
//         setCurrentCourse(null); // Clear current course
//         if (wasSuccessful) {
//             fetchCourses(); // Refetch courses to update the list
//         }
//     };

//     // --- Conditional Rendering for Loading and Error States ---
//     if (isLoading) {
//         return <p style={styles.loading}>Loading Course Data...</p>;
//     }
//     if (error) {
//         return <p style={{ ...styles.message, color: 'red' }}>Error: {error}</p>;
//     }

//     // --- Main Component Render ---
//     return (
//         <div style={styles.container}>
//             <div style={styles.brandingArea}> 
//                 <LogoContainer/> 
//                 <span style={styles.abbreviation}>LMS</span> 
//             </div>
//             <div style={styles.headerRow}>
//                 <h1 style={styles.header}>Course Management 📚</h1>
//                 <button onClick={handleCreateNew} style={styles.createButton}>
//                     + Create New Course
//                 </button>
//             </div>
//             <p style={styles.subHeader}>View, create, edit, or delete courses and assign lecturers.</p>

//             <AdminCourseTable 
//                 courses={courses} 
//                 onEdit={handleEdit} 
//                 onDelete={handleDelete} 
//             />

//             {/* Course Form Modal */}
//             {isModalOpen && (
//                 <CourseFormModal 
//                     course={currentCourse} // Will be null for creation, an object for editing
//                     onClose={() => handleModalClose(false)} // Pass false for no refresh on simple close
//                     onSuccess={() => handleModalClose(true)} // Pass true to refresh on success
//                 />
//             )}
//         </div>
//     );
// }

// // Ensure the Admin role is required to access this portal
// export default withAuthGuard(AdminCourseManagement, [UserRole.ADMIN]);

// // --- STYLES ---
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
//         marginBottom: '20px' 
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
//         fontSize: '2em', 
//         color: '#1f2937' 
//     },
//     subHeader: { 
//         color: '#6b7280', 
//         marginBottom: '25px', 
//         borderBottom: '1px solid #e5e7eb', 
//         paddingBottom: '15px' 
//     },
//     createButton: {
//         padding: '10px 20px',
//         backgroundColor: '#10b981', 
//         color: 'white',
//         border: 'none',
//         borderRadius: '6px',
//         cursor: 'pointer',
//         fontWeight: 'bold',
//         transition: 'background-color 0.2s',
//         whiteSpace: 'nowrap',
//     },
//     loading: {
//         textAlign: 'center',
//         padding: '50px',
//         fontSize: '1.2em',
//         color: '#3b82f6',
//     },
//     message: {
//         padding: '10px',
//         backgroundColor: '#fef3c7',
//         border: '1px solid #fde68a',
//         borderRadius: '4px',
//     }
// };