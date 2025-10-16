// :::1::: components/AssignmentFormModal.js
import React, { useState, useEffect } from 'react';

function AssignmentFormModal({ assignment, courseId, onClose, onSuccess }) {
    const isEditing = !!assignment; 

    const [title, setTitle] = useState(assignment?.title || '');
    const [description, setDescription] = useState(assignment?.description || '');
    const [maxPoints, setMaxPoints] = useState(assignment?.maxPoints?.toString() || '100'); 
    const [dueDate, setDueDate] = useState(() => {
        if (assignment?.dueDate) {
            // Convert ISO string to local datetime format for input
            const date = new Date(assignment.dueDate);
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); 
            return date.toISOString().slice(0, 16);
        }
        // Default to current time for new assignments
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(''); 

    useEffect(() => {
        setError('');
    }, [title, description, maxPoints, dueDate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(''); 

        if (!courseId) {
            setError("Error: Course ID is missing. Cannot proceed.");
            setIsLoading(false);
            return;
        }

        if (!title.trim() || !dueDate || !maxPoints.trim()) {
            setError("Title, Due Date, and Max Points are required.");
            setIsLoading(false);
            return;
        }
        
        const parsedMaxPoints = parseInt(maxPoints, 10);
        if (isNaN(parsedMaxPoints) || parsedMaxPoints <= 0) {
            setError("Max Points must be a positive number.");
            setIsLoading(false);
            return;
        }

        const assignmentPayload = {
            title: title.trim(),
            description: description.trim(),
            dueDate: new Date(dueDate).toISOString(), 
            maxPoints: parsedMaxPoints,
        };

        const method = isEditing ? 'PUT' : 'POST';
        // Ensure both assignment ID and course ID are passed for PUT/DELETE
        const url = isEditing 
            ? `/api/lecturer/assignments?id=${assignment.id}&courseId=${courseId}` 
            : `/api/lecturer/assignments?courseId=${courseId}`;


        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(assignmentPayload),
            });

            const contentType = res.headers.get("content-type");
            let data = {};
            // FIX: Robust check for JSON response
            if (contentType && contentType.includes("application/json")) {
                data = await res.json();
            } else {
                const text = await res.text();
                console.error("Server Non-JSON Response (Form Modal):", text);
                setError(`Server returned non-JSON response (Status: ${res.status}). Ensure API route allows ${method}.`);
                setIsLoading(false);
                return;
            }

            if (res.ok) {
                alert(`Assignment successfully ${isEditing ? 'updated' : 'created'}.`);
                // The API should return the new/updated assignment
                onSuccess(data.assignment); 
            } else {
                setError(data.message || `Failed to ${isEditing ? 'update' : 'create'} assignment.`);
            }
        } catch (err) {
            console.error('Assignment Form Network Error:', err);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // (Modal UI and Styles omitted for brevity but remain the same)
    const modalStyles = {
        backdrop: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
        modal: { backgroundColor: 'white', padding: '30px', borderRadius: '8px', minWidth: '400px', maxWidth: '600px', position: 'relative', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' },
        header: { marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' },
        closeButton: { position: 'absolute', top: '15px', right: '25px', fontSize: '1.5em', cursor: 'pointer', color: '#666' },
        form: { display: 'flex', flexDirection: 'column', gap: '15px' },
        formGroup: { display: 'flex', flexDirection: 'column' },
        label: { fontWeight: 'bold', marginBottom: '5px', color: '#333' },
        input: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1em' },
        textarea: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '100px', fontSize: '1em' },
        error: { color: '#b91c1c', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '4px', marginBottom: '15px' },
        buttonGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
        cancelButton: { padding: '10px 15px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
        saveButton: { padding: '10px 15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }
    };

    return (
        <div style={modalStyles.backdrop}>
            <div style={modalStyles.modal}>
                <h2 style={modalStyles.header}>{isEditing ? 'Edit Assignment' : 'Create New Assignment'}</h2>
                <span style={modalStyles.closeButton} onClick={() => onClose(false)}>&times;</span> 
                
                {error && <p style={modalStyles.error}>{error}</p>}

                <form onSubmit={handleSubmit} style={modalStyles.form}>
                    <div style={modalStyles.formGroup}>
                        <label htmlFor="title" style={modalStyles.label}>Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Assignment Title"
                            style={modalStyles.input}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div style={modalStyles.formGroup}>
                        <label htmlFor="dueDate" style={modalStyles.label}>Due Date</label>
                        <input
                            type="datetime-local" 
                            id="dueDate"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            style={modalStyles.input}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div style={modalStyles.formGroup}>
                        <label htmlFor="maxPoints" style={modalStyles.label}>Max Points</label>
                        <input
                            type="number"
                            id="maxPoints"
                            value={maxPoints}
                            onChange={(e) => setMaxPoints(e.target.value)}
                            placeholder="e.g., 100"
                            min="1"
                            style={modalStyles.input}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div style={modalStyles.formGroup}>
                        <label htmlFor="description" style={modalStyles.label}>Description (Optional)</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Detailed description of the assignment..."
                            style={modalStyles.textarea}
                            disabled={isLoading}
                        />
                    </div>

                    <div style={modalStyles.buttonGroup}>
                        <button type="button" onClick={() => onClose(false)} style={modalStyles.cancelButton} disabled={isLoading}>
                            Cancel
                        </button>
                        <button type="submit" style={modalStyles.saveButton} disabled={isLoading}>
                            {isLoading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Assignment')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AssignmentFormModal;

// // components/AssignmentFormModal.js
// import React, { useState, useEffect } from 'react';

// // This component can be used for both creating and editing assignments.
// // - For creation: Pass `courseId` and no `assignment` prop.
// // - For editing: Pass `courseId` and the `assignment` object.
// function AssignmentFormModal({ assignment, courseId, onClose, onSuccess }) {
//     const isEditing = !!assignment; // True if an assignment object is provided for editing

//     // State for form fields
//     const [title, setTitle] = useState(assignment?.title || '');
//     const [description, setDescription] = useState(assignment?.description || '');
//     const [maxPoints, setMaxPoints] = useState(assignment?.maxPoints?.toString() || '100'); // Store as string for input type="number"
//     const [dueDate, setDueDate] = useState(() => {
//         if (assignment?.dueDate) {
//             // Format existing dueDate to 'YYYY-MM-DDTHH:MM' for datetime-local input
//             const date = new Date(assignment.dueDate);
//             date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); // Adjust for timezone to get local time
//             return date.toISOString().slice(0, 16);
//         }
//         // Default to current date/time for new assignments
//         const now = new Date();
//         now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
//         return now.toISOString().slice(0, 16);
//     });

//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState(''); // Use error for messages

//     useEffect(() => {
//         // Reset error when form data changes
//         setError('');
//     }, [title, description, maxPoints, dueDate]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);
//         setError(''); // Clear previous errors

//         if (!title.trim() || !dueDate || !maxPoints.trim()) {
//             setError("Title, Due Date, and Max Points are required.");
//             setIsLoading(false);
//             return;
//         }
        
//         const parsedMaxPoints = parseInt(maxPoints, 10);
//         if (isNaN(parsedMaxPoints) || parsedMaxPoints <= 0) {
//             setError("Max Points must be a positive number.");
//             setIsLoading(false);
//             return;
//         }

//         // Prepare the data payload for the API
//         const assignmentPayload = {
//             title: title.trim(),
//             description: description.trim(),
//             dueDate: new Date(dueDate).toISOString(), // Send as ISO string
//             maxPoints: parsedMaxPoints,
//             // courseId is NOT included here; it's sent in the URL query.
//         };

//         // Determine API method and URL
//         const method = isEditing ? 'PUT' : 'POST';
//         // 🔑 CRITICAL FIX: Pass `courseId` as a query parameter.
//         // If editing, also pass the assignment ID in the URL.
//         const url = isEditing 
//             ? `/api/lecturer/assignments/${assignment.id}?courseId=${courseId}`
//             : `/api/lecturer/assignments?courseId=${courseId}`;

//         // Ensure courseId is valid
//         if (!courseId) {
//             setError("Error: No course selected for assignment. Please report this issue.");
//             setIsLoading(false);
//             return;
//         }

//         try {
//             const res = await fetch(url, {
//                 method,
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(assignmentPayload),
//             });

//             // Handle non-JSON responses from server for better debugging
//             const contentType = res.headers.get("content-type");
//             let data = {};
//             if (contentType && contentType.includes("application/json")) {
//                 data = await res.json();
//             } else {
//                 const text = await res.text();
//                 console.error("Server Non-JSON Response:", text);
//                 setError(`Server returned non-JSON response (Status: ${res.status}). Ensure API route is correct.`);
//                 return;
//             }

//             if (res.ok) {
//                 alert(`Assignment successfully ${isEditing ? 'updated' : 'created'}.`);
//                 onSuccess(data.assignment); // Pass the updated/created assignment back
//             } else {
//                 setError(data.message || `Failed to ${isEditing ? 'update' : 'create'} assignment.`);
//             }
//         } catch (err) {
//             console.error('Assignment Form Network Error:', err);
//             setError('Network error. Please check your connection and try again.');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div style={modalStyles.backdrop}>
//             <div style={modalStyles.modal}>
//                 <h2 style={modalStyles.header}>{isEditing ? 'Edit Assignment' : 'Create New Assignment'}</h2>
//                 <span style={modalStyles.closeButton} onClick={() => onClose(false)}>&times;</span> {/* Added close button */}
                
//                 {error && <p style={modalStyles.error}>{error}</p>}

//                 <form onSubmit={handleSubmit} style={modalStyles.form}>
//                     {/* Title Input */}
//                     <div style={modalStyles.formGroup}>
//                         <label htmlFor="title" style={modalStyles.label}>Title</label>
//                         <input
//                             type="text"
//                             id="title"
//                             value={title}
//                             onChange={(e) => setTitle(e.target.value)}
//                             placeholder="Assignment Title"
//                             style={modalStyles.input}
//                             required
//                             disabled={isLoading}
//                         />
//                     </div>

//                     {/* Due Date Input */}
//                     <div style={modalStyles.formGroup}>
//                         <label htmlFor="dueDate" style={modalStyles.label}>Due Date</label>
//                         <input
//                             type="datetime-local" // Changed to datetime-local for better UX
//                             id="dueDate"
//                             value={dueDate}
//                             onChange={(e) => setDueDate(e.target.value)}
//                             style={modalStyles.input}
//                             required
//                             disabled={isLoading}
//                         />
//                     </div>

//                     {/* Max Points Input */}
//                     <div style={modalStyles.formGroup}>
//                         <label htmlFor="maxPoints" style={modalStyles.label}>Max Points</label>
//                         <input
//                             type="number"
//                             id="maxPoints"
//                             value={maxPoints}
//                             onChange={(e) => setMaxPoints(e.target.value)}
//                             placeholder="e.g., 100"
//                             min="1"
//                             style={modalStyles.input}
//                             required
//                             disabled={isLoading}
//                         />
//                     </div>

//                     {/* Description Textarea */}
//                     <div style={modalStyles.formGroup}>
//                         <label htmlFor="description" style={modalStyles.label}>Description (Optional)</label>
//                         <textarea
//                             id="description"
//                             value={description}
//                             onChange={(e) => setDescription(e.target.value)}
//                             placeholder="Detailed description of the assignment..."
//                             style={modalStyles.textarea}
//                             disabled={isLoading}
//                         />
//                     </div>

//                     <div style={modalStyles.buttonGroup}>
//                         <button type="button" onClick={() => onClose(false)} style={modalStyles.cancelButton} disabled={isLoading}>
//                             Cancel
//                         </button>
//                         <button type="submit" style={modalStyles.saveButton} disabled={isLoading}>
//                             {isLoading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Assignment')}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// }

// // --- MODAL STYLES (Consolidated and Cleaned) ---
// const modalStyles = {
//     backdrop: {
//         position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
//         backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex',
//         justifyContent: 'center', alignItems: 'center', zIndex: 1000
//     },
//     modal: {
//         backgroundColor: '#fff', padding: '30px', borderRadius: '8px',
//         width: '90%', maxWidth: '500px', boxShadow: '0 5px 25px rgba(0, 0, 0, 0.4)',
//         maxHeight: '90vh', overflowY: 'auto', position: 'relative'
//     },
//     header: {
//         borderBottom: '1px solid #e5e7eb', paddingBottom: '15px',
//         marginBottom: '20px', fontSize: '1.6em', color: '#1f2937'
//     },
//     closeButton: { // Added style for close button
//         position: 'absolute', top: '15px', right: '20px',
//         fontSize: '1.8em', cursor: 'pointer', color: '#6b7280',
//         lineHeight: '1'
//     },
//     form: { display: 'flex', flexDirection: 'column' },
//     formGroup: { marginBottom: '20px' },
//     label: {
//         display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151'
//     },
//     input: {
//         width: '100%', padding: '10px', border: '1px solid #d1d5db',
//         borderRadius: '4px', boxSizing: 'border-box',
//     },
//     textarea: {
//         width: '100%', padding: '10px', border: '1px solid #d1d5db',
//         borderRadius: '4px', boxSizing: 'border-box', minHeight: '80px',
//         resize: 'vertical'
//     },
//     error: { // Style for displaying errors
//         backgroundColor: '#fee2e2', color: '#ef4444', padding: '10px',
//         borderRadius: '4px', marginBottom: '15px', textAlign: 'center'
//     },
//     buttonGroup: {
//         display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '20px'
//     },
//     cancelButton: {
//         padding: '10px 20px', backgroundColor: '#6b7280', color: 'white',
//         border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
//     },
//     saveButton: {
//         padding: '10px 20px', backgroundColor: '#10b981', color: 'white',
//         border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
//     }
// };

// export default AssignmentFormModal;


// // import React, { useState } from 'react';

// // function AssignmentFormModal({ assignment, courseId, onClose, onSuccess }) {
// //     const isEditing = assignment && assignment.id;
    
// //     const [title, setTitle] = useState(assignment?.title || '');
// //     const [description, setDescription] = useState(assignment?.description || '');
// //     // 🔑 NEW STATE: Initialize maxPoints
// //     const [maxPoints, setMaxPoints] = useState(assignment?.maxPoints || 100); 
    
// //     const initialDate = assignment?.dueDate 
// //         ? new Date(assignment.dueDate).toISOString().split('T')[0] 
// //         : '';
        
// //     const [dueDate, setDueDate] = useState(initialDate);
// //     const [status, setStatus] = useState('');

// //     const handleSubmit = async (e) => {
// //         e.preventDefault();
// //         setStatus('Processing...');
        
// //         if (!title || !dueDate || !maxPoints) {
// //             setStatus('Error: Title, Due Date, and Max Points are required.');
// //             return;
// //         }
        
// //         // Ensure maxPoints is a number
// //         if (isNaN(parseInt(maxPoints))) {
// //              setStatus('Error: Max Points must be a number.');
// //              return;
// //         }

// //         const formData = {
// //             ...(isEditing && { id: assignment.id }), 
            
// //             title,
// //             description,
// //             dueDate: dueDate, 
// //             courseId: courseId,
// //             // 🔑 CRITICAL FIX: Include the maxPoints value
// //             maxPoints: parseInt(maxPoints), 
// //         };

// //         onSuccess(formData); 
// //     };

// //     return (
// //         <div style={modalStyles.backdrop}>
// //             <div style={modalStyles.modal}>
// //                 <h2 style={modalStyles.header}>{isEditing ? 'Edit Assignment' : 'Create New Assignment'}</h2>
// //                 <form onSubmit={handleSubmit} style={modalStyles.form}>
                    
// //                     {/* Assignment Title */}
// //                     <div style={modalStyles.formGroup}>
// //                         <label style={modalStyles.label}>Title</label>
// //                         <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={modalStyles.input}/>
// //                     </div>
                    
// //                     {/* Due Date */}
// //                     <div style={modalStyles.formGroup}>
// //                         <label style={modalStyles.label}>Due Date</label>
// //                         <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required style={modalStyles.input}/>
// //                     </div>
                    
// //                     {/* 🔑 NEW FIELD: Max Points */}
// //                     <div style={modalStyles.formGroup}>
// //                         <label style={modalStyles.label}>Max Points</label>
// //                         <input 
// //                             type="number" 
// //                             value={maxPoints} 
// //                             onChange={(e) => setMaxPoints(e.target.value)} 
// //                             required 
// //                             min="1"
// //                             style={modalStyles.input}
// //                         />
// //                     </div>

// //                     {/* Description */}
// //                     <div style={modalStyles.formGroup}>
// //                         <label style={modalStyles.label}>Description (Optional)</label>
// //                         <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={modalStyles.textarea}/>
// //                     </div>

// //                     <div style={modalStyles.status}>{status}</div>
                    
// //                     {/* Action Buttons */}
// //                     <div style={modalStyles.buttonGroup}>
// //                         <button type="button" onClick={onClose} style={modalStyles.cancelButton} disabled={status.includes('Processing')}>
// //                             Cancel
// //                         </button>
// //                         <button type="submit" style={modalStyles.saveButton} disabled={status.includes('Processing')}>
// //                             {isEditing ? 'Save Changes' : 'Create Assignment'}
// //                         </button>
// //                     </div>
// //                 </form>
// //             </div>
// //         </div>
// //     );
// // }

// // // ------------------------------------------------
// // // --- MODAL STYLES (No Change Required) ---
// // // ------------------------------------------------
// // const modalStyles = {
// //     backdrop: {
// //         position: 'fixed',
// //         top: 0,
// //         left: 0,
// //         width: '100%',
// //         height: '100%',
// //         backgroundColor: 'rgba(0, 0, 0, 0.6)',
// //         display: 'flex',
// //         justifyContent: 'center',
// //         alignItems: 'center',
// //         zIndex: 1000,
// //     },
// //     modal: {
// //         backgroundColor: '#fff',
// //         padding: '30px',
// //         borderRadius: '8px',
// //         width: '90%',
// //         maxWidth: '500px',
// //         boxShadow: '0 5px 25px rgba(0, 0, 0, 0.4)',
// //         maxHeight: '90vh',
// //         overflowY: 'auto',
// //     },
// //     header: {
// //         borderBottom: '1px solid #e5e7eb',
// //         paddingBottom: '15px',
// //         marginBottom: '20px',
// //         fontSize: '1.6em',
// //         color: '#1f2937'
// //     },
// //     form: { display: 'flex', flexDirection: 'column' },
// //     formGroup: { marginBottom: '20px' },
// //     label: { 
// //         display: 'block', 
// //         marginBottom: '8px', 
// //         fontWeight: 'bold', 
// //         color: '#374151' 
// //     },
// //     input: {
// //         width: '100%',
// //         padding: '10px',
// //         border: '1px solid #d1d5db',
// //         borderRadius: '4px',
// //         boxSizing: 'border-box',
// //     },
// //     textarea: {
// //         width: '100%',
// //         padding: '10px',
// //         border: '1px solid #d1d5db',
// //         borderRadius: '4px',
// //         boxSizing: 'border-box',
// //         minHeight: '80px',
// //         resize: 'vertical'
// //     },
// //     status: {
// //         marginTop: '15px',
// //         padding: '10px',
// //         color: '#4f46e5',
// //         textAlign: 'center'
// //     },
// //     buttonGroup: {
// //         display: 'flex',
// //         justifyContent: 'flex-end',
// //         gap: '15px',
// //         marginTop: '20px'
// //     },
// //     cancelButton: {
// //         padding: '10px 20px',
// //         backgroundColor: '#6b7280',
// //         color: 'white',
// //         border: 'none',
// //         borderRadius: '6px',
// //         cursor: 'pointer',
// //         fontWeight: 'bold'
// //     },
// //     saveButton: {
// //         padding: '10px 20px',
// //         backgroundColor: '#10b981',
// //         color: 'white',
// //         border: 'none',
// //         borderRadius: '6px',
// //         cursor: 'pointer',
// //         fontWeight: 'bold'
// //     }
// // };

// // export default AssignmentFormModal;