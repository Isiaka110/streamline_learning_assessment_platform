// File: components/AdminLecturerModal.js
import React, { useState, useEffect, useCallback } from 'react';

function AdminLecturerModal({ lecturer, onClose = () => {}, onSuccess = () => {} }) {
    const isEdit = !!lecturer; 

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
        assignedCourseIds: getInitialCourseIds(lecturer), 
    });
    
    const [allCourses, setAllCourses] = useState([]); 
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isCoursesLoading, setIsCoursesLoading] = useState(true);

    useEffect(() => {
        setFormData({
            name: lecturer?.name || '',
            email: lecturer?.email || '',
            password: '', 
            assignedCourseIds: getInitialCourseIds(lecturer),
        });
        setError(''); 
    }, [lecturer, getInitialCourseIds]);

    useEffect(() => {
        const fetchAllCourses = async () => {
            setIsCoursesLoading(true);
            try {
                const res = await fetch('/api/admin/courses'); 
                const data = await res.json();
                if (res.ok) {
                    setAllCourses(Array.isArray(data) ? data : data.courses || []); 
                } else {
                    setError(data.message || 'Failed to load classes.');
                }
            } catch (err) {
                console.error("Network error fetching courses:", err);
                setError('Could not load classes.');
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
        if (!formData.name || !formData.email) { setError('Please fill in name and email.'); return; }
        if (!isEdit && (!formData.password || formData.password.length < 6)) { setError('Password must be at least 6 characters.'); return; }

        setIsSaving(true);
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `/api/admin/lecturers/${lecturer.id}` : '/api/admin/lecturers';
        const courseIdField = isEdit ? 'newCourseIds' : 'courseIds'; 
        const payload = {
            name: formData.name.trim(),
            email: formData.email.toLowerCase(),
            [courseIdField]: formData.assignedCourseIds || []
        };
        if (!isEdit) { payload.password = formData.password; }

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok) { onSuccess(true); } 
            else { setError(data.message || `Failed to save teacher.`); }
        } catch (err) {
            console.error("Save operation network error:", err);
            setError('Network error. Transaction failed.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[1000] p-4" onClick={() => onClose(false)}>
            <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden relative shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="bg-primary p-8 text-white relative flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{isEdit ? 'Edit Teacher' : 'Register Teacher'}</h2>
                        <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">{isEdit ? 'Update account details' : 'Create new administrative access'}</p>
                    </div>
                    <button onClick={() => onClose(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="p-8 overflow-y-auto">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground ml-1 uppercase tracking-wider">Full Name</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                placeholder="e.g. Dr. Ada Lovelace"
                                className="w-full px-5 py-3 rounded-xl border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-semibold"
                                required 
                                disabled={isSaving} 
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground ml-1 uppercase tracking-wider">Email Address</label>
                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                placeholder="teacher@sla-platform.edu"
                                className="w-full px-5 py-3 rounded-xl border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-semibold"
                                required 
                                disabled={isSaving} 
                            />
                        </div>

                        {!isEdit && (
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-foreground ml-1 uppercase tracking-wider">Temporary Password</label>
                                <input 
                                    type="password" 
                                    name="password" 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    placeholder="Enter at least 6 characters"
                                    className="w-full px-5 py-3 rounded-xl border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-semibold"
                                    required={!isEdit} 
                                    minLength={6}
                                    disabled={isSaving} 
                                />
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground ml-1 uppercase tracking-wider">Assigned Classes</label>
                            <p className="text-[10px] font-bold text-secondary uppercase mb-2 tracking-tighter opacity-70">Hold CTRL to select multiple items</p>
                            <select 
                                name="assignedCourseIds" 
                                multiple 
                                value={formData.assignedCourseIds} 
                                onChange={handleChange} 
                                className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm min-h-[150px] bg-gray-50 font-semibold"
                                disabled={isCoursesLoading || isSaving}
                            >
                                {allCourses.map(course => (
                                    <option key={course.id} value={course.id} className="py-2 px-2 rounded-lg hover:bg-primary/10">
                                        [{course.code}] {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button 
                                type="button" 
                                onClick={() => onClose(false)} 
                                className="flex-1 btn-outline py-4 text-xs"
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={isSaving || isCoursesLoading}
                                className="flex-[2] btn-primary py-4 text-xs"
                            >
                                {isSaving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Teacher')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AdminLecturerModal;