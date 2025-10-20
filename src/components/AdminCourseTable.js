import React from 'react';

const AdminCourseTable = ({ courses, onEdit, onDelete }) => {
    
    // --- Table Styles ---
    const styles = {
        tableWrapper: { overflowX: 'auto', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
        table: { width: '100%', borderCollapse: 'collapse' },
        th: { borderBottom: '2px solid #374151', padding: '15px', textAlign: 'left', backgroundColor: '#f3f4f6', color: '#1f2937' },
        td: { borderBottom: '1px solid #e5e7eb', padding: '15px', color: '#374151' },
        tdCenter: { borderBottom: '1px solid #e5e7eb', padding: '20px', textAlign: 'center', color: '#6b7280' },
        tdActions: { 
            borderBottom: '1px solid #e5e7eb', 
            padding: '10px 15px', 
            display: 'flex', 
            gap: '10px' 
        },
        editButton: { 
            padding: '8px 12px', 
            backgroundColor: '#f59e0b', // Orange
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
        },
        deleteButton: { 
            padding: '8px 12px', 
            backgroundColor: '#ef4444', // Red
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
        },
        noAssignText: {
            color: '#ef4444', 
            fontWeight: 'bold'
        },
        // Helper style for smaller content cells
        tdSmall: { borderBottom: '1px solid #e5e7eb', padding: '15px 10px', color: '#374151', textAlign: 'center' },
    };

    return (
        <div style={styles.tableWrapper}>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Course Code</th>
                        <th style={styles.th}>Course Title</th>
                        <th style={styles.th}>Semester</th>
                        <th style={styles.th}>Year</th>
                        <th style={styles.th}>Description</th>
                        <th style={styles.th}>Lecturers Assigned 🧑‍🏫</th>
                        <th style={styles.th}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.length > 0 ? (
                        courses.map((course) => (
                            <tr key={course.id}>
                                <td style={styles.td}>{course.code}</td>
                                <td style={styles.td}>{course.title}</td>
                                
                                {/* ✅ FIX: Check against the full string values stored by the API */}
                                <td style={styles.tdSmall}>
                                    {course.semester === 'First Semester' ? '1st' : 
                                    (course.semester === 'Second Semester' ? '2nd' : 'N/A')}
                                </td>
                                
                                <td style={styles.tdSmall}>{course.year || 'N/A'}</td>
                                {/* ------------------------------------- */}

                                <td style={styles.td}>{course.description || 'N/A'}</td>
                                
                                {/* 🔑 Safe access to lecturers array */}
                                <td style={styles.td}>
                                    {course.lecturers && course.lecturers.length > 0 
                                        ? course.lecturers.map(lecturer => lecturer.name).join(', ') 
                                        : <span style={styles.noAssignText}>None Assigned</span>
                                    }
                                </td>

                                <td style={styles.tdActions}>
                                    <button 
                                        onClick={() => onEdit(course)} 
                                        style={styles.editButton}
                                        title={`Edit course: ${course.code}`} // Added title for accessibility
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        // The onDelete function from the parent component likely expects only the ID
                                        onClick={() => onDelete(course.id)} 
                                        style={styles.deleteButton}
                                        // 🌟 FIX APPLIED HERE for unescaped double quotes 
                                        title={`Permanently delete course &quot;${course.code}&quot;?`} 
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            {/* colSpan updated to 7 */}
                            <td colSpan="7" style={styles.tdCenter}>No courses found. Click &quot;+ Create New Course&quot; to add one.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AdminCourseTable;

// // components/AdminCourseTable.js

// import React from 'react';

// const AdminCourseTable = ({ courses, onEdit, onDelete }) => {
    
//     // --- Table Styles ---
//     const styles = {
//         tableWrapper: { overflowX: 'auto', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
//         table: { width: '100%', borderCollapse: 'collapse' },
//         th: { borderBottom: '2px solid #374151', padding: '15px', textAlign: 'left', backgroundColor: '#f3f4f6', color: '#1f2937' },
//         td: { borderBottom: '1px solid #e5e7eb', padding: '15px', color: '#374151' },
//         tdCenter: { borderBottom: '1px solid #e5e7eb', padding: '20px', textAlign: 'center', color: '#6b7280' },
//         tdActions: { 
//             borderBottom: '1px solid #e5e7eb', 
//             padding: '10px 15px', 
//             display: 'flex', 
//             gap: '10px' 
//         },
//         editButton: { 
//             padding: '8px 12px', 
//             backgroundColor: '#f59e0b', // Orange
//             color: 'white', 
//             border: 'none', 
//             borderRadius: '4px', 
//             cursor: 'pointer' 
//         },
//         deleteButton: { 
//             padding: '8px 12px', 
//             backgroundColor: '#ef4444', // Red
//             color: 'white', 
//             border: 'none', 
//             borderRadius: '4px', 
//             cursor: 'pointer' 
//         },
//         noAssignText: {
//             color: '#ef4444', 
//             fontWeight: 'bold'
//         }
//     };

//     return (
//         <div style={styles.tableWrapper}>
//             <table style={styles.table}>
//                 <thead>
//                     <tr>
//                         <th style={styles.th}>Course Code</th>
//                         <th style={styles.th}>Course Title</th>
//                         <th style={styles.th}>Description</th>
//                         <th style={styles.th}>Lecturers Assigned 🧑‍🏫</th>
//                         <th style={styles.th}>Actions</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {courses.length > 0 ? (
//                         courses.map((course) => (
//                             <tr key={course.id}>
//                                 <td style={styles.td}>{course.code}</td>
//                                 <td style={styles.td}>{course.title}</td>
//                                 <td style={styles.td}>{course.description || 'N/A'}</td>
                                
//                                 {/* 🔑 CRITICAL FIX: Safe access to lecturers array */}
//                                 <td style={styles.td}>
//                                     {course.lecturers && course.lecturers.length > 0 
//                                         ? course.lecturers.map(lecturer => lecturer.name).join(', ') 
//                                         : <span style={styles.noAssignText}>None Assigned</span>
//                                     }
//                                 </td>

//                                 <td style={styles.tdActions}>
//                                     <button 
//                                         onClick={() => onEdit(course)} 
//                                         style={styles.editButton}
//                                     >
//                                         Edit
//                                     </button>
//                                     <button 
//                                         onClick={() => onDelete(course.id, course.title)} 
//                                         style={styles.deleteButton}
//                                     >
//                                         Delete
//                                     </button>
//                                 </td>
//                             </tr>
//                         ))
//                     ) : (
//                         <tr>
//                             <td colSpan="5" style={styles.tdCenter}>No courses found. Click "+ Create New Course" to add one.</td>
//                         </tr>
//                     )}
//                 </tbody>
//             </table>
//         </div>
//     );
// };

// export default AdminCourseTable;