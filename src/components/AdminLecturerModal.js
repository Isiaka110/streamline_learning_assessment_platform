// File: components/AdminLecturerModal.js (FINAL FIXES)

import React, { useState, useEffect, useCallback } from 'react';

function AdminLecturerModal({ lecturer, onClose = () => {}, onSuccess = () => {} }) {
    const isEdit = !!lecturer; 

    // Helper to get initial assigned course IDs, handling both 'courses' and 'taughtCourses' field names
    const getInitialCourseIds = useCallback((lecturerObj) => {
        const courseList = lecturerObj?.courses || lecturerObj?.taughtCourses;
        if (courseList && courseList.length > 0) {
            return courseList.map(course => course.id);
        }
        return [];
    }, []); 

    const [formData, setFormData] = useState({
        name: lecturer?.name || '',
        email: lecturer?.email || '',
        password: '', 
        // Initial state set using the helper
        assignedCourseIds: getInitialCourseIds(lecturer), 
    });
    
    const [allCourses, setAllCourses] = useState([]); 
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isCoursesLoading, setIsCoursesLoading] = useState(true);

    // Effect for handling lecturer prop change
    useEffect(() => {
        setFormData({
            name: lecturer?.name || '',
            email: lecturer?.email || '',
            password: '', 
            assignedCourseIds: getInitialCourseIds(lecturer),
        });
        setError(''); 
    }, [lecturer, getInitialCourseIds]);

    // Effect for fetching all courses for the multi-select dropdown
    useEffect(() => {
        const fetchAllCourses = async () => {
            setIsCoursesLoading(true);
            try {
                const res = await fetch('/api/admin/courses'); 
                const data = await res.json();

                if (res.ok) {
                    // Assuming /api/admin/courses returns an array of courses directly
                    setAllCourses(Array.isArray(data) ? data : data.courses || []); 
                } else {
                    setError(data.message || 'Failed to load courses.');
                }
            } catch (err) {
                console.error("Network error fetching courses:", err);
                setError('Network error while loading courses.');
            } finally {
                setIsCoursesLoading(false);
            }
        };

        fetchAllCourses();
    }, []); 

    const handleChange = (e) => {
        const { name, value, options, type } = e.target;
        setError(''); 

        if (type === 'select-multiple') {
            const selectedOptions = Array.from(options)
                                     .filter(option => option.selected)
                                     .map(option => option.value);
            setFormData({ ...formData, [name]: selectedOptions });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Validation checks... (kept as is)
        if (!formData.name || !formData.email) {
            setError('Name and email are required.');
            return;
        }
        if (!isEdit && (!formData.password || formData.password.length < 6)) {
            setError('Password is required for new lecturer creation and must be at least 6 characters.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setIsSaving(true);

        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `/api/admin/lecturers/${lecturer.id}` : '/api/admin/lecturers';

        // 🔑 CRITICAL FIX: The PUT API likely expects 'newCourseIds' for course changes.
        // We will use 'courseIds' for POST and 'newCourseIds' for PUT to match the likely API requirement.
        const courseIdField = isEdit ? 'newCourseIds' : 'courseIds'; 

        const payload = {
            name: formData.name.trim(),
            email: formData.email.toLowerCase(),
            // 🔑 Dynamic field name for course IDs based on operation type
            [courseIdField]: formData.assignedCourseIds || []
        };
        
        if (!isEdit) {
            payload.password = formData.password;
        }

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload), // The payload now contains 'newCourseIds' for PUT
            });
            
            const contentType = res.headers.get("content-type");
            let data = {};
            if (contentType && contentType.includes("application/json")) {
                data = await res.json();
            } else {
                const textError = await res.text();
                console.error("Server returned non-JSON error response:", textError);
                setError(`Server Error ${res.status}: ${textError.substring(0, 100)}...`);
                setIsSaving(false);
                return; 
            }

            if (res.ok) {
                alert(`✅ Lecturer successfully ${isEdit ? 'updated' : 'created'}.`);
                onSuccess(true); 
            } else {
                // If API returns an error, it will show here (e.g., "Missing required fields")
                setError(data.message || `Failed to ${isEdit ? 'update' : 'create'} lecturer. Status: ${res.status}`);
            }

        } catch (err) {
            console.error("Save operation network error:", err);
            setError('Network error during save operation. Check your connection.');
        } finally {
            setIsSaving(false);
        }
    };

    // --- Component Rendering (no changes needed here, keeping your inline styles) ---
    return (
        <div style={modalStyles.backdrop} onClick={() => onClose(false)}>
            <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 style={modalStyles.header}>{isEdit ? `Edit Lecturer: ${lecturer.name}` : 'Create New Lecturer'}</h2>
                <span style={modalStyles.closeButton} onClick={() => onClose(false)}>&times;</span> 
                
                {error && <p style={modalStyles.error}>🚨 {error}</p>}

                <form onSubmit={handleSubmit}>
                    
                    {/* Name Input */}
                    <div style={modalStyles.formGroup}>
                        <label htmlFor="name" style={{fontWeight: 'bold'}}>Full Name:</label>
                        <input 
                            type="text" 
                            id="name"
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            style={modalStyles.input}
                            disabled={isSaving}
                            required
                        />
                    </div>
                    
                    {/* Email Input */}
                    <div style={modalStyles.formGroup}>
                        <label htmlFor="email" style={{fontWeight: 'bold'}}>Email:</label>
                        <input 
                            type="email" 
                            id="email"
                            name="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            style={modalStyles.input}
                            disabled={isSaving}
                            required
                        />
                    </div>

                    {/* Password Input (Only for Create) */}
                    {!isEdit && (
                        <div style={modalStyles.formGroup}>
                            <label htmlFor="password" style={{fontWeight: 'bold'}}>Initial Password:</label>
                            <input 
                                type="password" 
                                id="password"
                                name="password" 
                                value={formData.password} 
                                onChange={handleChange} 
                                style={modalStyles.input}
                                disabled={isSaving}
                                required={!isEdit}
                                minLength={6}
                            />
                        </div>
                    )}
                    
                    {/* Course Assignment Multi-select */}
                    <div style={modalStyles.formGroup}>
                        <label htmlFor="assignedCourseIds" style={{fontWeight: 'bold'}}>Assign Courses (Optional):</label>
                        <select 
                            id="assignedCourseIds"
                            name="assignedCourseIds" 
                            multiple 
                            value={formData.assignedCourseIds} 
                            onChange={handleChange} 
                            style={{ ...modalStyles.input, height: 'auto', minHeight: '100px' }} 
                            disabled={isCoursesLoading || isSaving}
                        >
                            {isCoursesLoading && <option value="">Loading Courses...</option>}
                            {!isCoursesLoading && allCourses.length === 0 && <option value="">No courses available</option>}
                            
                            {allCourses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.code} - {course.title}
                                </option>
                            ))}
                        </select>
                        {allCourses.length === 0 && !isCoursesLoading && <p style={{color: 'orange', fontSize: '0.8em', marginTop: '5px'}}>No courses found to assign.</p>}
                        <small style={{display: 'block', marginTop: '5px', color: '#6b7280'}}>Hold down Ctrl (Windows) / Command (Mac) to select multiple courses.</small>
                    </div>

                    <button type="submit" disabled={isSaving || isCoursesLoading} style={modalStyles.submitButton}>
                        {isSaving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Lecturer')}
                    </button>
                </form>
            </div>
        </div>
    );
}

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
    input: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
    submitButton: { width: '100%', padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' },
    error: { color: 'white', backgroundColor: '#f87171', padding: '10px', borderRadius: '4px', marginBottom: '15px' }
};

export default AdminLecturerModal;