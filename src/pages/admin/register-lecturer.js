import React, { useState, useEffect } from 'react';
import { withAuthGuard } from '../../components/AuthGuard';
import { UserRole } from '@prisma/client';

function RegisterLecturerPage() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', courseIds: [] });
    const [availableCourses, setAvailableCourses] = useState([]);
    const [submissionStatus, setSubmissionStatus] = useState('');
    const [loadingCourses, setLoadingCourses] = useState(true);

    // 1. Fetch ALL available courses for assignment
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Hitting the new API endpoint
                const res = await fetch('/api/admin/all-courses'); 
                
                // 🔑 FIX 1: Robust JSON parsing check
                const contentType = res.headers.get("content-type");
                let data = {};
                
                if (contentType && contentType.includes("application/json")) {
                    data = await res.json();
                } else {
                    throw new Error(`Server returned unexpected format (Status: ${res.status}).`);
                }

                if (res.ok) {
                    setAvailableCourses(data.courses || []);
                } else {
                    throw new Error(data.message || 'Failed to fetch courses with Admin access.');
                }
            } catch (error) {
                console.error("Error fetching courses:", error);
                // This is the error message the user sees if the course API fails
                setSubmissionStatus(`Error loading courses: ${error.message || 'Check network/API definitions.'}`);
            } finally {
                setLoadingCourses(false);
            }
        };
        fetchCourses();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCourseChange = (e) => {
        // Collect all selected course IDs from the multi-select box
        const options = e.target.options;
        const selectedIds = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedIds.push(options[i].value);
            }
        }
        setFormData(prev => ({ ...prev, courseIds: selectedIds }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmissionStatus('Registering lecturer...');

        // Basic validation
        if (!formData.name || !formData.email || !formData.password || formData.password.length < 6) {
             setSubmissionStatus('Registration failed: Name, email, and password (min 6 chars) are required.');
             return;
        }

        try {
            // Hitting the new API endpoint
            const res = await fetch('/api/admin/register-lecturer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            
            // 🔑 FIX 2: Robust JSON parsing check
            const contentType = res.headers.get("content-type");
            let data = {};
            if (contentType && contentType.includes("application/json")) {
                data = await res.json();
            } else {
                // Catches the HTML 404/500 page from the server
                throw new Error(`Server API failed (Status: ${res.status}). Check /api/admin/register-lecturer file.`);
            }

            if (res.ok) {
                setSubmissionStatus(`✅ Success! ${data.lecturer.name} registered.`);
                // Clear form upon success
                setFormData({ name: '', email: '', password: '', courseIds: [] });
            } else {
                setSubmissionStatus(`Registration failed: ${data.message}`);
            }
        } catch (error) {
            setSubmissionStatus(`An unexpected error occurred: ${error.message}`);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Admin: Register New Lecturer</h1>
            <p style={styles.status}>{submissionStatus}</p>
            
            <form onSubmit={handleSubmit} style={styles.form}>
                
                <input style={styles.input} type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required />
                <input style={styles.input} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
                <input style={styles.input} type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Temporary Password" required />

                <label style={styles.label}>Assign Initial Courses (Optional):</label>
                {loadingCourses ? (
                    <p>Loading courses...</p>
                ) : (
                    <select 
                        name="courses" 
                        multiple 
                        value={formData.courseIds} 
                        onChange={handleCourseChange} 
                        style={styles.select}
                        // 🔑 FIX 3: Remove 'required' to make course assignment optional
                        // required 
                    >
                        <option value="" disabled>-- Select 0 or more courses --</option>
                        {availableCourses.map(course => (
                            <option key={course.id} value={course.id}>
                                {course.code}: {course.title}
                            </option>
                        ))}
                    </select>
                )}
                <p style={styles.helpText}>Hold CTRL or CMD to select multiple courses.</p>

                <button type="submit" style={styles.button} disabled={loadingCourses}>Create Lecturer Account</button>
            </form>
        </div>
    );
}

export default withAuthGuard(RegisterLecturerPage, [UserRole.ADMIN]);





// Simple inline styles for demonstration
const styles = {
    container: { maxWidth: '600px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' },
    header: { fontSize: '2em', marginBottom: '20px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    input: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px' },
    label: { marginTop: '10px', fontWeight: 'bold' },
    select: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '150px' },
    helpText: { fontSize: '0.8em', color: '#666', marginTop: '-10px' },
    button: { padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    status: { color: 'green', fontWeight: 'bold', marginBottom: '15px' }
};