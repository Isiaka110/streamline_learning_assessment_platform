// ::::::::3:::::: components/AssignmentManager.js
import React, { useState, useEffect, useCallback } from 'react';
import AssignmentTable from './AssignmentTable'; // Assumed to exist
import AssignmentFormModal from './AssignmentFormModal'; 
import AssignmentGradingTool from './AssignmentGradingTool'; 

function AssignmentManager({ courseId, courseCode }) {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAssignment, setCurrentAssignment] = useState(null); 
    const [assignmentToGrade, setAssignmentToGrade] = useState(null); 
    

    const fetchAssignments = useCallback(async () => {
        if (!courseId) return;
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`/api/lecturer/assignments?courseId=${courseId}`);
            const data = await response.json();

            if (response.ok) {
                // The API now returns assignments with 'totalSubmissions' and 'needsGrading' calculated
                setAssignments(data.assignments || []); 
            } else {
                setError(data.message || 'Failed to load assignments.');
                setAssignments([]);
            }
        } catch (err) {
            console.error("Fetch Assignments Network Error:", err);
            setError('Network error: Could not connect to assignment service.');
            setAssignments([]);
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchAssignments(); 
    }, [fetchAssignments]);
    
    // --- Modal Handlers ---
    const handleCreateClick = () => { setCurrentAssignment(null); setIsModalOpen(true); };
    const handleEditClick = (assignment) => { setCurrentAssignment(assignment); setIsModalOpen(true); };
    const handleModalClose = (success = false) => {
        setIsModalOpen(false);
        setCurrentAssignment(null);
        if (success) { fetchAssignments(); }
    };
    const handleAssignmentSaveSuccess = (savedAssignment) => {
        // Find if assignment already exists by ID
        setAssignments(prev => {
            const index = prev.findIndex(a => a.id === savedAssignment.id);
            if (index !== -1) {
                // Update existing assignment
                return prev.map(a => (a.id === savedAssignment.id ? savedAssignment : a));
            } else {
                // Add new assignment to the top
                return [savedAssignment, ...prev];
            }
        });
        handleModalClose(); 
    };

    // --- Grading Handlers ---
    const handleGradeClick = (assignment) => { setAssignmentToGrade(assignment); };

    const handleExitGrading = (shouldRefresh = false) => {
        setAssignmentToGrade(null);
        if (shouldRefresh) {
            fetchAssignments(); // CRITICAL: Refresh assignments list after grading
        }
    };

    /**
     * Handles deletion (DELETE) of an assignment.
     */
    const handleDelete = async (assignmentId, assignmentTitle) => {
        if (!window.confirm(`Are you sure you want to permanently delete: "${assignmentTitle}"? This cannot be undone.`)) {
            return;
        }

        if (!courseId) {
            alert('Error: Course ID is missing. Cannot perform deletion.');
            return;
        }
        
        try {
            // This relies on the API handler allowing DELETE (fixed in API section)
            const response = await fetch(`/api/lecturer/assignments?id=${assignmentId}&courseId=${courseId}`, { method: 'DELETE' });
            
            if (response.status === 204) { // 204 is the standard successful DELETE response (No Content)
                alert(`Assignment "${assignmentTitle}" deleted successfully.`);
                setAssignments(prev => prev.filter(a => a.id !== assignmentId));
            } else {
                const contentType = response.headers.get("content-type");
                let errorMessage = `Failed to delete assignment (Status: ${response.status}).`;

                if (contentType && contentType.includes("application/json")) {
                    const data = await response.json().catch(() => ({}));
                    errorMessage = data.message || errorMessage;
                } else {
                    const text = await response.text();
                    console.error("Non-JSON Delete Error Response:", text);
                    errorMessage = text || errorMessage;
                }
                alert(`Error: ${errorMessage}`);
            }
        } catch (e) {
            console.error("Delete Operation Network Error:", e);
            alert('Network error: Could not delete assignment.');
        }
    };


    if (error) return <p style={styles.error}>Error: {error}</p>;
    if (loading) return <p style={styles.loading}>Loading assignments...</p>;

    // Render Grading Tool if assignmentToGrade is set
    if (assignmentToGrade) {
        return (
            <div style={styles.gradingContainer}>
                <AssignmentGradingTool
                    assignmentId={assignmentToGrade.id}
                    assignmentTitle={assignmentToGrade.title}
                    onGradingComplete={() => handleExitGrading(true)}
                />
            </div>
        );
    }
    
    // Assumed AssignmentTable component definition (needed for context)
    const AssignmentTable = ({ assignments, onEdit, onDelete, onGrade }) => (
        <table style={styles.table}>
            <thead>
                <tr>
                    <th style={styles.th}>Assignment Title</th>
                    <th style={styles.th}>Due Date</th>
                    <th style={styles.th}>Submissions</th>
                    <th style={styles.th}>Needs Grading</th>
                    <th style={styles.th}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {assignments.map(a => (
                    <tr key={a.id} style={styles.tr}>
                        <td style={styles.td}>{a.title}</td>
                        <td style={styles.td}>{new Date(a.dueDate).toLocaleDateString()}</td>
                        {/* 🔑 FIX: Use the counts returned from the API */}
                        <td style={styles.td}>{a.totalSubmissions || a._count?.submissions || 0}</td>
                        <td style={styles.td}><span style={{ color: a.needsGrading > 0 ? 'red' : 'green', fontWeight: 'bold' }}>{a.needsGrading || 0}</span></td>
                        <td style={styles.td}>
                            <div style={styles.actionButtons}>
                                <button onClick={() => onEdit(a)} style={{...styles.button, backgroundColor: '#4f46e5'}}>Edit</button>
                                <button onClick={() => onDelete(a.id, a.title)} style={{...styles.button, backgroundColor: '#ef4444'}}>Delete</button>
                                <button onClick={() => onGrade(a)} style={{...styles.button, backgroundColor: '#10b981'}}>Grade Submissions</button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );


    return (
        <div style={styles.container}>
            <div style={styles.headerRow}>
                <h1 style={styles.header}>Assignments for {courseCode}</h1>
                <button 
                    onClick={handleCreateClick} 
                    style={styles.createButton}
                >
                    + Create New Assignment
                </button>
            </div>
            
            {assignments.length > 0 ? (
                <AssignmentTable
                    assignments={assignments}
                    onEdit={handleEditClick}
                    onDelete={handleDelete}
                    onGrade={handleGradeClick} 
                />
            ) : (
                <p style={styles.infoText}>No assignments have been created for this course yet. Click the button above to start.</p>
            )}

            {isModalOpen && (
                <AssignmentFormModal
                    assignment={currentAssignment} 
                    courseId={courseId}
                    onClose={handleModalClose}
                    onSuccess={handleAssignmentSaveSuccess}
                />
            )}
        </div>
    );
}

const styles = {
    container: { padding: '20px' },
    loading: { padding: '20px', color: '#3b82f6' },
    error: { color: '#b91c1c', backgroundColor: '#fee2e2', padding: '15px', borderRadius: '4px' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '20px' },
    header: { fontSize: '1.8em', color: '#1f2937' },
    createButton: { padding: '10px 15px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    infoText: { padding: '20px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '4px', textAlign: 'center' },
    gradingContainer: { padding: '20px' },
    // Table Styles
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { borderBottom: '2px solid #333', padding: '12px 8px', textAlign: 'left', backgroundColor: '#f3f4f6', fontWeight: 'bold' },
    tr: { borderBottom: '1px solid #eee' },
    td: { padding: '12px 8px', verticalAlign: 'middle' },
    actionButtons: { display: 'flex', gap: '8px' },
    button: { padding: '8px 12px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9em' }
};

export default AssignmentManager;
// import React, { useState, useEffect, useCallback } from 'react';
// import AssignmentTable from './AssignmentTable';
// import AssignmentFormModal from './AssignmentFormModal'; 

// function AssignmentManager({ courseId, courseCode }) {
//     const [assignments, setAssignments] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [currentAssignment, setCurrentAssignment] = useState(null); 

//     /**
//      * Fetches all assignments for the currently selected course from the API.
//      */
//     const fetchAssignments = useCallback(async () => {
//         if (!courseId) return;
//         setLoading(true);
//         setError(null);
        
//         try {
//             const response = await fetch(`/api/lecturer/assignments?courseId=${courseId}`);
//             const data = await response.json();

//             if (response.ok) {
//                 setAssignments(data.assignments || []);
//             } else {
//                 setError(data.message || 'Failed to load assignments.');
//                 setAssignments([]);
//             }
//         } catch (err) {
//             console.error("Fetch Assignments Network Error:", err);
//             setError('Network error: Could not connect to assignment service.');
//             setAssignments([]);
//         } finally {
//             setLoading(false);
//         }
//     }, [courseId]);

//     useEffect(() => {
//         fetchAssignments(); 
//     }, [fetchAssignments]);
    
//     /**
//      * Handles creation (POST) or updating (PUT) of an assignment.
//      */
//     const handleAssignmentSave = async (formData) => {
//         const isUpdate = !!formData.id;
//         const method = isUpdate ? 'PUT' : 'POST';
        
//         console.log(`Sending API Request (${method}):`, formData);
        
//         try {
//             const url = `/api/lecturer/assignments`; 

//             const response = await fetch(url, {
//                 method: method,
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(formData),
//             });
//             const data = await response.json();

//             if (response.ok) {
//                 alert(`Assignment ${isUpdate ? 'updated' : 'created'} successfully!`);
//                 setIsModalOpen(false);
//                 fetchAssignments(); 
//             } else {
//                 alert(`Error: ${data.message || 'Failed to save assignment.'}`);
//             }
//         } catch (e) {
//             console.error("Save Operation Network Error:", e);
//             alert('Network error: Could not save assignment.');
//         }
//     };

//     /**
//      * Handles deletion (DELETE) of an assignment.
//      */
//     const handleDelete = async (assignmentId, assignmentTitle) => {
//         if (!window.confirm(`Are you sure you want to permanently delete: "${assignmentTitle}"? This cannot be undone.`)) {
//             return;
//         }

//         if (!courseId) {
//              alert('Error: Course ID is missing. Cannot perform deletion.');
//              return;
//         }
        
//         console.log(`Sending DELETE Request for ID: ${assignmentId} in Course: ${courseId}`);
        
//         try {
//             // 🔑 CRITICAL FIX: Include both assignmentId (as 'id') and courseId in the query string
//             const response = await fetch(`/api/lecturer/assignments?id=${assignmentId}&courseId=${courseId}`, { method: 'DELETE' });
//             const data = await response.json();

//             if (response.ok) {
//                 alert('Assignment deleted successfully.');
//                 fetchAssignments(); 
//             } else {
//                 alert(`Error: ${data.message || 'Failed to delete assignment.'}`);
//             }
//         } catch (e) {
//             console.error("Delete Operation Network Error:", e);
//             alert('Network error: Could not delete assignment.');
//         }
//     };
    
//     // Placeholder for grading logic
//     const handleGradeSubmissions = (assignment) => {
//         alert(`Redirecting to grading interface for: ${assignment.title}`);
//     };

//     // --- Modal/UI Handlers ---

//     const handleCreateEdit = (assignment = null) => {
//         setCurrentAssignment(assignment);
//         setIsModalOpen(true);
//     };


//     if (loading) return <p style={styles.info}>Loading assignments for {courseCode}...</p>;
    
//     return (
//         <div style={styles.container}>
//             <div style={styles.headerRow}>
//                 <h3 style={styles.header}>Assignments for: {courseCode}</h3>
//                 <button 
//                     onClick={() => handleCreateEdit(null)} 
//                     style={styles.addButton}
//                 >
//                     + Create New Assignment
//                 </button>
//             </div>
            
//             {error && <p style={styles.error}>{error}</p>}

//             <AssignmentTable 
//                 assignments={assignments} 
//                 onEdit={handleCreateEdit}
//                 onDelete={handleDelete}
//                 onGrade={handleGradeSubmissions}
//             />

//             {isModalOpen && (
//                 <AssignmentFormModal
//                     assignment={currentAssignment}
//                     courseId={courseId}
//                     onClose={() => setIsModalOpen(false)}
//                     onSuccess={handleAssignmentSave} 
//                 />
//             )}
//         </div>
//     );
// }

// // ------------------------------------------------
// // --- STYLES ---
// // ------------------------------------------------
// const styles = {
//     container: { padding: '15px' },
//     headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
//     header: { fontSize: '1.6em', color: '#1f2937' },
//     addButton: {
//         padding: '10px 15px',
//         backgroundColor: '#10b981', 
//         color: 'white',
//         border: 'none',
//         borderRadius: '6px',
//         cursor: 'pointer',
//         fontWeight: 'bold',
//         transition: 'background-color 0.2s',
//     },
//     info: { padding: '15px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '4px', textAlign: 'center', marginTop: '10px' },
//     error: { padding: '15px', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '4px', marginBottom: '15px' }
// };

// export default AssignmentManager;