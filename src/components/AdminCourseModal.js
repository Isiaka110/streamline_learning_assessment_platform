import React, { useState, useEffect } from 'react';

function AdminCourseModal({ course, onClose, onSuccess }) {
    const isEdit = !!course; // True if 'course' object is provided (for editing)
    const currentYear = new Date().getFullYear().toString(); // Default year for new courses

    const [formData, setFormData] = useState({
        code: course?.code || '',
        title: course?.title || '',
        // Initialize Semester and Year from existing course data (if editing)
        semester: course?.semester || '', 
        year: course?.year || currentYear, 
        description: course?.description || '',
        // Store IDs of currently assigned lecturers for multi-select
        assignedLecturerIds: course?.lecturers?.map(lec => lec.id) || [], 
    });
    
    const [allLecturers, setAllLecturers] = useState([]); // List of all possible lecturers
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLecturersLoading, setIsLecturersLoading] = useState(true);

    // --- FIX: Fetch all lecturers for the assignment dropdown ---
    useEffect(() => {
        const fetchLecturers = async () => {
            setIsLecturersLoading(true);
            setError('');
            try {
                // API route to get all lecturers (e.g., /api/admin/lecturers)
                const res = await fetch('/api/admin/lecturers'); 
                const data = await res.json();

                if (res.ok) {
                    setAllLecturers(data.lecturers || []);
                } else {
                    // Log error but don't prevent the rest of the form from loading
                    console.error("Failed to load lecturers:", data.message);
                    setError(data.message || 'Failed to load lecturers for assignment.');
                }
            } catch (err) {
                console.error("Network error fetching lecturers:", err);
                setError('Network error while loading lecturers.');
            } finally {
                // IMPORTANT: Ensure loading state is set to false even on error
                setIsLecturersLoading(false);
            }
        };

        fetchLecturers();
    }, []); // Run once on mount

    const handleChange = (e) => {
        const { name, value, options, type } = e.target;
        setError(''); // Clear error on input change

        if (type === 'select-multiple') {
            // For multi-select, get all selected option values
            const selectedOptions = Array.from(options).filter(option => option.selected).map(option => option.value);
            setFormData({ ...formData, [name]: selectedOptions });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // --- Validation ---
        if (!formData.code || !formData.title || !formData.semester || !formData.year) {
            setError('Course Code, Title, Semester, and Year are required.');
            return;
        }

        setIsSaving(true);

        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `/api/admin/courses/${course.id}` : '/api/admin/courses';

        // Prepare payload, including required Semester and Year
        const payload = {
            code: formData.code, 
            title: formData.title,
            semester: formData.semester,
            year: formData.year,
            description: formData.description,
            // Array of lecturer IDs to connect/disconnect
            lecturerIds: formData.assignedLecturerIds 
        };

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            
            const contentType = res.headers.get("content-type");
            let data = {};
            if (contentType && contentType.includes("application/json")) {
                data = await res.json();
            } else {
                setError(`Server returned non-JSON response (Status: ${res.status}). Ensure API route is correct.`);
                return; 
            }

            if (res.ok) {
                // Replaced forbidden alert() with console.log
                console.log(`✅ Course successfully ${isEdit ? 'updated' : 'created'}.`);
                onSuccess(true); 
            } else {
                setError(data.message || `Failed to ${isEdit ? 'update' : 'create'} course.`);
            }

        } catch (err) {
            console.error("Save operation network error:", err);
            setError('Network error during save operation. Check your connection.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={modalStyles.backdrop}>
            <div style={modalStyles.modal}>
                <h2 style={modalStyles.header}>{isEdit ? `Edit Course: ${course.title}` : 'Create New Course'}</h2>
                <span style={modalStyles.closeButton} onClick={() => onClose(false)}>&times;</span>
                
                {error && <p style={modalStyles.error}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    
                    {/* Course Code Input */}
                    <div style={modalStyles.formGroup}>
                        <label htmlFor="code">Course Code:</label>
                        <input 
                            type="text" 
                            id="code"
                            name="code" 
                            value={formData.code} 
                            onChange={handleChange} 
                            style={modalStyles.input}
                            required
                        />
                    </div>
                    
                    {/* Course Title Input */}
                    <div style={modalStyles.formGroup}>
                        <label htmlFor="title">Course Title:</label>
                        <input 
                            type="text" 
                            id="title"
                            name="title" 
                            value={formData.title} 
                            onChange={handleChange} 
                            style={modalStyles.input}
                            required
                        />
                    </div>

                    {/* Semester and Year Selection Group */}
                    <div style={modalStyles.twoColumnGroup}>
                        {/* Semester Select */}
                        <div style={modalStyles.formGroup}>
                            <label htmlFor="semester">Semester:</label>
                            <select
                                id="semester"
                                name="semester"
                                value={formData.semester}
                                onChange={handleChange}
                                style={modalStyles.input}
                                required
                            >
                                <option value="">Select Semester</option>
                                <option value="FIRST">1st Semester</option>
                                <option value="SECOND">2nd Semester</option>
                            </select>
                        </div>

                        {/* Year Input */}
                        <div style={modalStyles.formGroup}>
                            <label htmlFor="year">Year:</label>
                            <input 
                                type="number" 
                                id="year"
                                name="year" 
                                value={formData.year} 
                                onChange={handleChange} 
                                style={modalStyles.input}
                                placeholder="e.g., 2024"
                                min="2000" 
                                max={currentYear}
                                required
                            />
                        </div>
                    </div>

                    {/* Course Description Textarea */}
                    <div style={modalStyles.formGroup}>
                        <label htmlFor="description">Description (Optional):</label>
                        <textarea 
                            id="description"
                            name="description" 
                            value={formData.description} 
                            onChange={handleChange} 
                            style={modalStyles.textarea}
                        ></textarea>
                    </div>

                    {/* Lecturer Assignment Multi-select */}
                    <div style={modalStyles.formGroup}>
                        <label htmlFor="assignedLecturerIds">Assign Lecturers (Optional):</label>
                        <select 
                            id="assignedLecturerIds"
                            name="assignedLecturerIds" 
                            multiple // Enable multi-select
                            value={formData.assignedLecturerIds} 
                            onChange={handleChange} 
                            style={{ ...modalStyles.input, height: 'auto', minHeight: '100px' }} 
                            disabled={isSaving} // Only disable if actively saving the form
                        >
                            {isLecturersLoading && <option value="" disabled>Loading Lecturers...</option>}
                            {!isLecturersLoading && allLecturers.length === 0 && <option value="" disabled>No lecturers available</option>}
                            
                            {allLecturers.map(lecturer => (
                                <option key={lecturer.id} value={lecturer.id}>
                                    {lecturer.name} ({lecturer.email})
                                </option>
                            ))}
                        </select>
                        {isLecturersLoading && <p style={{color: '#3b82f6', fontSize: '0.8em', marginTop: '5px'}}>Fetching list...</p>}
                        {!isLecturersLoading && allLecturers.length === 0 && <p style={{color: 'orange', fontSize: '0.8em', marginTop: '5px'}}>No lecturers found to assign.</p>}
                    </div>

                    <button type="submit" disabled={isSaving} style={modalStyles.submitButton}>
                        {isSaving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Course')}
                    </button>
                </form>
            </div>
        </div>
    );
}

// --- Modal Styles ---
const modalStyles = {
    backdrop: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
        justifyContent: 'center', alignItems: 'center', zIndex: 1000
    },
    modal: {
        backgroundColor: 'white', padding: '30px', borderRadius: '8px',
        maxWidth: '600px', width: '90%', position: 'relative',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    },
    header: { margin: '0 0 20px 0', fontSize: '1.5em', borderBottom: '1px solid #eee', paddingBottom: '10px' },
    closeButton: { position: 'absolute', top: '10px', right: '20px', fontSize: '1.5em', cursor: 'pointer' },
    formGroup: { marginBottom: '15px' },
    // Style for responsive two-column layout
    twoColumnGroup: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '15px'
    },
    input: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', minHeight: '80px' },
    submitButton: { width: '100%', padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' },
    error: { color: 'white', backgroundColor: '#f87171', padding: '10px', borderRadius: '4px', marginBottom: '15px' }
};

export default AdminCourseModal;

// // components/AdminCourseModal.js

// import React, { useState, useEffect } from 'react';

// function AdminCourseModal({ course, onClose, onSuccess }) {
//     const isEdit = !!course; // True if 'course' object is provided (for editing)

//     const [formData, setFormData] = useState({
//         code: course?.code || '',
//         title: course?.title || '',
//         description: course?.description || '',
//         // Store IDs of currently assigned lecturers for multi-select
//         assignedLecturerIds: course?.lecturers?.map(lec => lec.id) || [], 
//     });
    
//     const [allLecturers, setAllLecturers] = useState([]); // List of all possible lecturers
//     const [error, setError] = useState('');
//     const [isSaving, setIsSaving] = useState(false);
//     const [isLecturersLoading, setIsLecturersLoading] = useState(true);

//     // Fetch all lecturers for the assignment dropdown
//     useEffect(() => {
//         const fetchLecturers = async () => {
//             setIsLecturersLoading(true);
//             try {
//                 // This API route (pages/api/admin/lecturers/index.js) provides all lecturers
//                 const res = await fetch('/api/admin/lecturers'); 
//                 const data = await res.json();

//                 if (res.ok) {
//                     setAllLecturers(data.lecturers || []);
//                 } else {
//                     setError(data.message || 'Failed to load lecturers for assignment.');
//                 }
//             } catch (err) {
//                 console.error("Network error fetching lecturers:", err);
//                 setError('Network error while loading lecturers.');
//             } finally {
//                 setIsLecturersLoading(false);
//             }
//         };

//         fetchLecturers();
//     }, []); // Run once on mount

//     const handleChange = (e) => {
//         const { name, value, options, type } = e.target;
//         setError(''); // Clear error on input change

//         if (type === 'select-multiple') {
//             // For multi-select, get all selected option values
//             const selectedOptions = Array.from(options).filter(option => option.selected).map(option => option.value);
//             setFormData({ ...formData, [name]: selectedOptions });
//         } else {
//             setFormData({ ...formData, [name]: value });
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
        
//         // --- Validation ---
//         if (!formData.code || !formData.title) {
//             setError('Course Code and Title are required.');
//             return;
//         }

//         setIsSaving(true);

//         const method = isEdit ? 'PUT' : 'POST';
//         // API routes: POST to /api/admin/courses, PUT to /api/admin/courses/[id]
//         const url = isEdit ? `/api/admin/courses/${course.id}` : '/api/admin/courses';

//         // Prepare payload, including assigned lecturers
//         const payload = {
//             code: formData.code, 
//             title: formData.title, 
//             description: formData.description,
//             // Array of lecturer IDs to connect/disconnect
//             lecturerIds: formData.assignedLecturerIds 
//         };

//         try {
//             const res = await fetch(url, {
//                 method,
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload),
//             });
            
//             // Handle non-JSON responses gracefully
//             const contentType = res.headers.get("content-type");
//             let data = {};
//             if (contentType && contentType.includes("application/json")) {
//                 data = await res.json();
//             } else {
//                 setError(`Server returned non-JSON response (Status: ${res.status}). Ensure API route is correct.`);
//                 return; 
//             }

//             if (res.ok) {
//                 alert(`✅ Course successfully ${isEdit ? 'updated' : 'created'}.`);
//                 onSuccess(true); // Call onSuccess, passing true for success
//             } else {
//                 setError(data.message || `Failed to ${isEdit ? 'update' : 'create'} course.`);
//             }

//         } catch (err) {
//             console.error("Save operation network error:", err);
//             setError('Network error during save operation. Check your connection.');
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     return (
//         <div style={modalStyles.backdrop}>
//             <div style={modalStyles.modal}>
//                 <h2 style={modalStyles.header}>{isEdit ? `Edit Course: ${course.title}` : 'Create New Course'}</h2>
//                 <span style={modalStyles.closeButton} onClick={() => onClose(false)}>&times;</span>
                
//                 {error && <p style={modalStyles.error}>{error}</p>}

//                 <form onSubmit={handleSubmit}>
                    
//                     {/* Course Code Input */}
//                     <div style={modalStyles.formGroup}>
//                         <label htmlFor="code">Course Code:</label>
//                         <input 
//                             type="text" 
//                             id="code"
//                             name="code" 
//                             value={formData.code} 
//                             onChange={handleChange} 
//                             style={modalStyles.input}
//                             required
//                         />
//                     </div>
                    
//                     {/* Course Title Input */}
//                     <div style={modalStyles.formGroup}>
//                         <label htmlFor="title">Course Title:</label>
//                         <input 
//                             type="text" 
//                             id="title"
//                             name="title" 
//                             value={formData.title} 
//                             onChange={handleChange} 
//                             style={modalStyles.input}
//                             required
//                         />
//                     </div>

//                     {/* Course Description Textarea */}
//                     <div style={modalStyles.formGroup}>
//                         <label htmlFor="description">Description (Optional):</label>
//                         <textarea 
//                             id="description"
//                             name="description" 
//                             value={formData.description} 
//                             onChange={handleChange} 
//                             style={modalStyles.textarea}
//                         ></textarea>
//                     </div>

//                     {/* Lecturer Assignment Multi-select */}
//                     <div style={modalStyles.formGroup}>
//                         <label htmlFor="assignedLecturerIds">Assign Lecturers (Optional):</label>
//                         <select 
//                             id="assignedLecturerIds"
//                             name="assignedLecturerIds" 
//                             multiple // Enable multi-select
//                             value={formData.assignedLecturerIds} 
//                             onChange={handleChange} 
//                             style={{ ...modalStyles.input, height: 'auto', minHeight: '100px' }} // Adjust height for multi-select
//                             disabled={isLecturersLoading || isSaving}
//                         >
//                             {isLecturersLoading && <option value="">Loading Lecturers...</option>}
//                             {!isLecturersLoading && allLecturers.length === 0 && <option value="">No lecturers available</option>}
                            
//                             {allLecturers.map(lecturer => (
//                                 <option key={lecturer.id} value={lecturer.id}>
//                                     {lecturer.name} ({lecturer.email})
//                                 </option>
//                             ))}
//                         </select>
//                         {allLecturers.length === 0 && !isLecturersLoading && <p style={{color: 'orange', fontSize: '0.8em', marginTop: '5px'}}>No lecturers found to assign.</p>}
//                     </div>

//                     <button type="submit" disabled={isSaving || isLecturersLoading} style={modalStyles.submitButton}>
//                         {isSaving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Course')}
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// }

// // --- Modal Styles ---
// const modalStyles = {
//     backdrop: {
//         position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
//         backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
//         justifyContent: 'center', alignItems: 'center', zIndex: 1000
//     },
//     modal: {
//         backgroundColor: 'white', padding: '30px', borderRadius: '8px',
//         maxWidth: '600px', width: '90%', position: 'relative',
//         boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
//     },
//     header: { margin: '0 0 20px 0', fontSize: '1.5em', borderBottom: '1px solid #eee', paddingBottom: '10px' },
//     closeButton: { position: 'absolute', top: '10px', right: '20px', fontSize: '1.5em', cursor: 'pointer' },
//     formGroup: { marginBottom: '15px' },
//     input: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
//     textarea: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', minHeight: '80px' },
//     submitButton: { width: '100%', padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' },
//     error: { color: 'white', backgroundColor: '#f87171', padding: '10px', borderRadius: '4px', marginBottom: '15px' }
// };

// export default AdminCourseModal;