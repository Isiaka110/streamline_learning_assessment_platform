import React, { useState, useEffect, useCallback } from 'react';

const SEMESTERS = ['First Semester', 'Second Semester'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR + 2 - i); 

const CourseFormModal = ({ course, onClose, onSuccess }) => {
    const isEdit = !!course && !!course.id; 
    
    // Determine the initial lecturer ID safely
    const initialLecturerId = course?.lecturers?.[0]?.id || ''; 
    
    const [formData, setFormData] = useState({
        title: course?.title || '',
        // Use either 'code' or 'courseCode' from the course object as a fallback
        code: course?.code || course?.courseCode || '', 
        description: course?.description || '', 
        
        semester: course?.semester || SEMESTERS[0], 
        // Ensure year is stored as a string, matching the <select> values
        year: course?.year?.toString() || CURRENT_YEAR.toString(), 
        
        lecturerId: initialLecturerId, 
    });
    
    const [allLecturers, setAllLecturers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState(null);

    // --- Fetch Lecturers for the dropdown ---
    const fetchLecturers = useCallback(async () => {
        setLoading(true); 
        setFormError(null);
        try {
            const response = await fetch(`/api/admin/lecturers`); 
            const data = await response.json();

            if (response.ok) {
                const lecturerData = Array.isArray(data) ? data : [];
                setAllLecturers([
                    { id: '', name: 'Unassigned', email: '' }, 
                    ...lecturerData
                ]);
            } else {
                setFormError(data.message || 'Failed to load lecturer data.');
            }
        } catch (err) {
            setFormError('Network error loading lecturers.');
        } finally {
            setLoading(false); 
        }
    }, []);

    useEffect(() => {
        fetchLecturers();
    }, [fetchLecturers]);

    // --- Handle Input Changes ---
    const handleChange = (e) => {
        const { name, value } = e.target; 
        setFormData(prev => ({ 
            ...prev, 
            [name]: value 
        }));
        setFormError(null);
    };

    // --- Handle Form Submission ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFormError(null);

        // Client-side validation for all required fields
        if (!formData.title || !formData.code || !formData.semester || !formData.year) {
            setFormError("🚨 Missing required course fields (Title, Code, Semester, Year).");
            setLoading(false);
            return;
        }

        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `/api/admin/courses/${course.id}` : '/api/admin/courses';
        
        const payload = {
            // FIX: Frontend sends courseCode
            courseCode: formData.code, 
            title: formData.title,
            description: formData.description === '' ? null : formData.description,
            semester: formData.semester, 
            year: parseInt(formData.year), 
            // FIX: Map single selected lecturerId to lecturerIds array for the API
            lecturerIds: formData.lecturerId ? [formData.lecturerId] : [], 
        };
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (jsonError) {
                    const textError = await response.text();
                    setFormError(`Server Error ${response.status}: ${textError.substring(0, 100)}...`);
                    setLoading(false);
                    return;
                }
                setFormError(errorData.message || `Failed to ${isEdit ? 'update' : 'create'} course. Status: ${response.status}`);
                setLoading(false);
                return;
            }

            onSuccess(true);
        } catch (err) {
            setFormError('Network error during form submission. Check server connection.');
        } finally {
            setLoading(false);
        }
    };

    // --- STYLES (Omitted for brevity, assuming they are in the component) ---
    const styles = {
        modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
        modalContent: { backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '90%', maxWidth: '600px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }, 
        closeButton: { position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.2em', cursor: 'pointer', color: '#6b7280' },
        formGroup: { marginBottom: '20px' },
        label: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' },
        input: { width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' },
        textarea: { height: '100px', resize: 'vertical' },
        submitButton: { padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
        error: { padding: '10px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '4px', marginBottom: '15px' },
        buttonGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }
    };

    return (
        <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
                <button onClick={onClose} style={styles.closeButton}>&times;</button>
                <h2>{isEdit ? 'Edit Course' : 'Create New Course'}</h2>

                {formError && <p style={styles.error}>🚨 {formError}</p>}
                
                <form onSubmit={handleSubmit}>
                    
                    {/* Title */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Course Title*</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} style={styles.input} disabled={loading} required />
                    </div>
                    
                    {/* Code */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Course Code* (e.g., CS101)</label>
                        <input type="text" name="code" value={formData.code} onChange={handleChange} style={styles.input} disabled={loading || isEdit} required />
                    </div>
                    
                    {/* Semester */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Semester*</label>
                        <select
                            name="semester"
                            value={formData.semester}
                            onChange={handleChange}
                            style={styles.input}
                            disabled={loading}
                            required
                        >
                            {SEMESTERS.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {/* Year */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Academic Year*</label>
                        <select
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            style={styles.input}
                            disabled={loading}
                            required
                        >
                            {YEARS.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    {/* Assigned Lecturer */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Assigned Lecturer</label>
                        <select
                            name="lecturerId"
                            value={formData.lecturerId}
                            onChange={handleChange} 
                            style={styles.input} 
                            disabled={loading}
                        >
                            {loading && allLecturers.length === 0 && <option value="">Loading Lecturers...</option>}
                            {!loading && allLecturers.length <= 1 && <option value="">No Lecturers Found</option>} 
                            
                            {allLecturers.map(lecturer => (
                                <option key={lecturer.id} value={lecturer.id}>
                                    {lecturer.name} {lecturer.id !== '' && `(${lecturer.email})`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} style={{ ...styles.input, ...styles.textarea }} disabled={loading} />
                    </div>

                    <div style={styles.buttonGroup}>
                        <button 
                            type="button"
                            onClick={onClose} 
                            style={{...styles.submitButton, backgroundColor: '#6b7280', marginRight: '10px'}} 
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button type="submit" style={styles.submitButton} disabled={loading}>
                            {loading ? 'Saving...' : (isEdit ? 'Update Course' : 'Create Course')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CourseFormModal;


// // components/CourseFormModal.js

// import React, { useState, useEffect, useCallback } from 'react';

// const CourseFormModal = ({ course, onClose, onSuccess }) => {
//     const isEdit = !!course;
    
//     const initialLecturerId = course?.lecturer?.id || ''; 
    
//     const [formData, setFormData] = useState({
//         title: course?.title || '',
//         code: course?.code || '',
//         description: course?.description || '', // Description can be empty
//         lecturerId: initialLecturerId, 
//     });
    
//     const [allLecturers, setAllLecturers] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [formError, setFormError] = useState(null);

//     // --- Fetch Lecturers for the dropdown ---
//     const fetchLecturers = useCallback(async () => {
//         try {
//             const response = await fetch(`/api/admin/lecturers`); 
//             const data = await response.json();

//             if (response.ok) {
//                 setAllLecturers([
//                     { id: '', name: 'Unassigned', email: '' }, 
//                     ...data
//                 ]);
//             } else {
//                 setFormError(data.message || 'Failed to load lecturer data.');
//             }
//         } catch (err) {
//             console.error("Network error fetching lecturers:", err);
//             setFormError('Network error loading lecturers.');
//         }
//     }, []);

//     useEffect(() => {
//         fetchLecturers();
//     }, [fetchLecturers]);

//     // --- Handle Input Changes ---
//     const handleChange = (e) => {
//         const { name, value } = e.target; 
//         setFormData(prev => ({ 
//             ...prev, 
//             [name]: value 
//         }));
//     };

//     // --- Handle Form Submission ---
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setFormError(null);

//         // Frontend validation - only title and code are required
//         if (!formData.title || !formData.code) {
//             setFormError("Title and Code are required.");
//             setLoading(false);
//             return;
//         }
//         // Description length validation removed
//         // Credits validation removed

//         const method = isEdit ? 'PUT' : 'POST';
//         const url = isEdit ? `/api/admin/courses/${course.id}` : '/api/admin/courses';
        
//         const payload = {
//             ...formData,
//             // Ensure description is not undefined if empty for API consistency
//             description: formData.description === '' ? null : formData.description,
//             lecturerId: formData.lecturerId || null 
//         };
        
//         try {
//             const response = await fetch(url, {
//                 method: method,
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload),
//             });
            
//             if (!response.ok) {
//                 let errorData;
//                 try {
//                     errorData = await response.json();
//                 } catch (jsonError) {
//                     const textError = await response.text();
//                     console.error("Failed to parse error JSON:", jsonError, "Raw response:", textError);
//                     setFormError(`Server Error ${response.status}: ${textError.substring(0, 100)}...`);
//                     setLoading(false);
//                     return;
//                 }
//                 setFormError(errorData.message || `Failed to ${isEdit ? 'update' : 'create'} course. Status: ${response.status}`);
//                 setLoading(false);
//                 return;
//             }

//             const data = await response.json();
//             alert(`SUCCESS: ${data.message}`);
//             onSuccess();
//         } catch (err) {
//             console.error("Network or unexpected error during submission:", err);
//             setFormError('Network error during form submission. Check server connection.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // --- STYLES ---
//     const styles = {
//         modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
//         modalContent: { backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '90%', maxWidth: '600px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', position: 'relative' },
//         closeButton: { position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.2em', cursor: 'pointer', color: '#6b7280' },
//         formGroup: { marginBottom: '20px' },
//         label: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' },
//         input: { width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' },
//         textarea: { height: '100px', resize: 'vertical' },
//         submitButton: { padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
//         error: { padding: '10px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '4px', marginBottom: '15px' },
//     };

//     return (
//         <div style={styles.modalOverlay}>
//             <div style={styles.modalContent}>
//                 <button onClick={onClose} style={styles.closeButton}>&times;</button>
//                 <h2>{isEdit ? 'Edit Course' : 'Create New Course'}</h2>

//                 {formError && <p style={styles.error}>🚨 {formError}</p>}
                
//                 <form onSubmit={handleSubmit}>
//                     <div style={styles.formGroup}>
//                         <label style={styles.label}>Course Title*</label>
//                         <input type="text" name="title" value={formData.title} onChange={handleChange} style={styles.input} disabled={loading} required />
//                     </div>
                    
//                     <div style={styles.formGroup}>
//                         <label style={styles.label}>Course Code* (e.g., CS101)</label>
//                         <input type="text" name="code" value={formData.code} onChange={handleChange} style={styles.input} disabled={loading || isEdit} required />
//                     </div>
                    
//                     <div style={styles.formGroup}>
//                         <label style={styles.label}>Description</label>
//                         <textarea name="description" value={formData.description} onChange={handleChange} style={{ ...styles.input, ...styles.textarea }} disabled={loading} />
//                     </div>

//                     <div style={styles.formGroup}>
//                         <label style={styles.label}>Assigned Lecturer</label>
//                         <select
//                             name="lecturerId"
//                             value={formData.lecturerId}
//                             onChange={handleChange} 
//                             style={styles.input} 
//                             disabled={loading}
//                         >
//                             {allLecturers.length === 0 && <option value="">Loading Lecturers...</option>}
//                             {allLecturers.map(lecturer => (
//                                 <option key={lecturer.id} value={lecturer.id}>
//                                     {lecturer.name} {lecturer.id !== '' && `(${lecturer.email})`}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     <button type="submit" style={styles.submitButton} disabled={loading}>
//                         {loading ? 'Saving...' : (isEdit ? 'Update Course' : 'Create Course')}
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default CourseFormModal;