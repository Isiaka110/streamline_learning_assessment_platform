// components/LecturerCommunication.js
import React, { useState, useEffect, useCallback } from 'react';
import CourseCommentThread from './CourseCommentThread'; // Reusing the established communication component

/**
 * Manages the lecturer's view for student-lecturer private communication threads
 * within a specific course.
 * @param {string} lecturerId - The ID of the currently logged-in lecturer (the sender/recipient).
 * @param {string} courseId - The ID of the currently selected course.
 * @param {string} courseCode - The course code for display purposes.
 */
function LecturerCommunication({ lecturerId, courseId, courseCode }) {
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(true);
    // Initialize selectedStudent to null to ensure the first render is managed
    const [selectedStudent, setSelectedStudent] = useState(null); 
    const [error, setError] = useState(null);

    // 1. Fetch the list of enrolled students for the current course
    const fetchEnrolledStudents = useCallback(async () => {
        if (!courseId) {
            setLoadingStudents(false);
            // It's generally cleaner to return success here if no course is selected
            // and handle the missing course outside this component or in the effect.
            return; 
        }

        setLoadingStudents(true);
        setError(null);
        
        // CRITICAL FIX: The URL must match the API route file structure
        const apiUrl = `/api/lecturer/courses/${courseId}/students`;

        try {
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                // Try to parse JSON error message, fallback to status text
                const contentType = response.headers.get("content-type");
                let errorData = {};
                
                if (contentType && contentType.includes("application/json")) {
                    errorData = await response.json();
                }

                // Throw error with message from server if available
                throw new Error(errorData.message || `Server error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const fetchedStudents = data.students || [];

            setStudents(fetchedStudents);
            
            // Automatically select the first student if available and no student is currently selected
            if (fetchedStudents.length > 0 && !selectedStudent) {
                setSelectedStudent(fetchedStudents[0]);
            } else if (fetchedStudents.length === 0) {
                 setSelectedStudent(null);
            }
            
        } catch (err) {
            console.error("Error fetching students:", err);
            // Provide a more specific error message from the caught error
            setError(`Failed to fetch student list: ${err.message || 'Network issue or server error.'}`);
            setStudents([]);
            setSelectedStudent(null);
        } finally {
            setLoadingStudents(false);
        }
    }, [courseId, selectedStudent]); // Added selectedStudent dependency to maintain current selection after refresh


    useEffect(() => {
        // Trigger fetch only if courseId is present
        if (courseId) {
            fetchEnrolledStudents();
        } else {
            // Reset state if courseId is removed
            setStudents([]);
            setSelectedStudent(null);
            setLoadingStudents(false);
            setError(null);
        }
    }, [courseId, fetchEnrolledStudents]); // Depend on courseId and the memoized function

    const handleStudentSelect = (e) => {
        const studentId = e.target.value;
        const student = students.find(s => s.id === studentId);
        setSelectedStudent(student);
    };

    if (!courseId) return <p style={styles.info}>Please select a course to manage communication threads.</p>;
    if (error) return <p style={styles.error}>Error: {error}</p>;
    if (loadingStudents) return <p style={styles.loading}>Loading student list...</p>;

    return (
        <div style={styles.container}>
            <h3 style={styles.header}>
                Direct Communication for {courseCode}
            </h3>

            {students.length === 0 ? (
                <p style={styles.info}>There are no students currently enrolled in this course.</p>
            ) : (
                <>
                    {/* 2. Student Selector Dropdown */}
                    <div style={styles.selectorContainer}>
                        <label htmlFor="student-select" style={styles.selectorLabel}>View Conversation With:</label>
                        <select
                            id="student-select"
                            style={styles.selectInput}
                            // Use || '' for controlled component value to handle null/undefined
                            value={selectedStudent?.id || ''} 
                            onChange={handleStudentSelect}
                        >
                             <option value="" disabled>Select a student</option>
                            {students.map(student => (
                                <option key={student.id} value={student.id}>
                                    {student.name} ({student.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 3. Communication Thread */}
                    {selectedStudent ? ( 
                        <div style={styles.threadArea}>
                            <h4 style={styles.threadHeader}>
                                Conversation with {selectedStudent.name}
                            </h4>
                            <CourseCommentThread 
                                courseId={courseId} 
                                currentUserId={lecturerId} 
                                otherUserId={selectedStudent.id} 
                            />
                        </div>
                    ) : (
                        // Fallback if the list loaded but no student was selected (shouldn't happen with auto-select, but safe)
                        <p style={styles.info}>Please select a student to view their conversation.</p>
                    )}
                </>
            )}
        </div>
    );
}

// ----------------------------------------------------------------------
// --- STYLES ---
// ----------------------------------------------------------------------

const styles = {
    container: { padding: '20px 0' },
    header: { fontSize: '1.4em', color: '#1f2937', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '20px' },
    loading: { color: '#3b82f6', padding: '10px' },
    error: { 
        color: '#b91c1c', 
        backgroundColor: '#fee2e2', 
        padding: '10px', 
        borderRadius: '4px', 
        border: '1px solid #ef4444' 
    },
    info: { padding: '10px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '4px' },
    
    selectorContainer: { marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px' },
    selectorLabel: { fontWeight: 'bold', color: '#374151', fontSize: '1em' },
    selectInput: { padding: '8px 10px', border: '1px solid #ccc', borderRadius: '4px', minWidth: '300px', fontSize: '1em' },
    
    threadArea: { marginTop: '20px', borderTop: '2px solid #e5e7eb', paddingTop: '20px' },
    threadHeader: { fontSize: '1.2em', color: '#4f46e5', marginBottom: '15px' },
};

export default LecturerCommunication;




// import React, { useState, useEffect, useCallback } from 'react';
// import CourseCommentThread from './CourseCommentThread'; // Reusing the established communication component

// /**
//  * Manages the lecturer's view for student-lecturer private communication threads
//  * within a specific course.
//  * * @param {string} lecturerId - The ID of the currently logged-in lecturer (the sender/recipient).
//  * @param {string} courseId - The ID of the currently selected course.
//  * @param {string} courseCode - The course code for display purposes.
//  */
// function LecturerCommunication({ lecturerId, courseId, courseCode }) {
//     const [students, setStudents] = useState([]);
//     const [loadingStudents, setLoadingStudents] = useState(true);
//     const [selectedStudent, setSelectedStudent] = useState(null);
//     const [error, setError] = useState(null);

//     // 1. Fetch the list of enrolled students for the current course
//     const fetchEnrolledStudents = useCallback(async () => {
//         setLoadingStudents(true);
//         setError(null);
//         // NOTE: You must create an API route /api/lecturer/courses/[courseId]/students
//         // to fetch the list of students enrolled in this course.
//         try {
//             const response = await fetch(`/api/lecturer/courses/${courseId}/students`);
//             const data = await response.json();

//             if (response.ok) {
//                 setStudents(data.students || []);
//                 // Automatically select the first student to start a conversation thread
//                 if (data.students && data.students.length > 0) {
//                     setSelectedStudent(data.students[0]);
//                 } else {
//                     setSelectedStudent(null);
//                 }
//             } else {
//                 setError(data.message || 'Failed to fetch enrolled students.');
//                 setStudents([]);
//             }
//         } catch (err) {
//             console.error("Network error fetching students:", err);
//             setError('Network error: Could not fetch student list.');
//             setStudents([]);
//         } finally {
//             setLoadingStudents(false);
//         }
//     }, [courseId]);

//     useEffect(() => {
//         if (courseId) {
//             fetchEnrolledStudents();
//         }
//     }, [fetchEnrolledStudents, courseId]);

//     const handleStudentSelect = (e) => {
//         const studentId = e.target.value;
//         const student = students.find(s => s.id === studentId);
//         setSelectedStudent(student);
//     };

//     if (error) return <p style={styles.error}>Error: {error}</p>;
//     if (loadingStudents) return <p style={styles.loading}>Loading student list...</p>;

//     return (
//         <div style={styles.container}>
//             <h3 style={styles.header}>
//                 Direct Communication for {courseCode}
//             </h3>

//             {students.length === 0 ? (
//                 <p style={styles.info}>There are no students currently enrolled in this course.</p>
//             ) : (
//                 <>
//                     {/* 2. Student Selector Dropdown */}
//                     <div style={styles.selectorContainer}>
//                         <label htmlFor="student-select" style={styles.selectorLabel}>View Conversation With:</label>
//                         <select
//                             id="student-select"
//                             style={styles.selectInput}
//                             value={selectedStudent?.id || ''}
//                             onChange={handleStudentSelect}
//                         >
//                             {students.map(student => (
//                                 <option key={student.id} value={student.id}>
//                                     {student.name} ({student.id})
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     {/* 3. Communication Thread */}
//                     {selectedStudent && (
//                         <div style={styles.threadArea}>
//                             <h4 style={styles.threadHeader}>
//                                 Conversation with {selectedStudent.name}
//                             </h4>
//                             {/* 🔑 Reusing the CourseCommentThread logic */}
//                             <CourseCommentThread 
//                                 courseId={courseId} 
//                                 // The lecturer is the current user (sender)
//                                 currentUserId={lecturerId} 
//                                 // The student is the other user (recipient)
//                                 otherUserId={selectedStudent.id} 
//                             />
//                         </div>
//                     )}
//                 </>
//             )}
//         </div>
//     );
// }

// // ----------------------------------------------------------------------
// // --- STYLES ---
// // ----------------------------------------------------------------------

// const styles = {
//     container: { padding: '20px 0' },
//     header: { fontSize: '1.4em', color: '#1f2937', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '20px' },
//     loading: { color: '#3b82f6' },
//     error: { color: '#b91c1c' },
//     info: { padding: '10px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '4px' },
    
//     selectorContainer: { marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px' },
//     selectorLabel: { fontWeight: 'bold', color: '#374151', fontSize: '1em' },
//     selectInput: { padding: '8px 10px', border: '1px solid #ccc', borderRadius: '4px', minWidth: '300px', fontSize: '1em' },
    
//     threadArea: { marginTop: '20px', borderTop: '2px solid #e5e7eb', paddingTop: '20px' },
//     threadHeader: { fontSize: '1.2em', color: '#4f46e5', marginBottom: '15px' },
// };

// export default LecturearCommunication;