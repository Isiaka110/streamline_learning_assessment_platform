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
        
        if (!formData.name || !formData.email) {
            setError('Name and email are required.');
            return;
        }
        if (!isEdit && (!formData.password || formData.password.length < 6)) {
            setError('Password is required for new lecturer creation (min 6 chars).');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setIsSaving(true);

        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `/api/admin/lecturers/${lecturer.id}` : '/api/admin/lecturers';
        const courseIdField = isEdit ? 'newCourseIds' : 'courseIds'; 

        const payload = {
            name: formData.name.trim(),
            email: formData.email.toLowerCase(),
            [courseIdField]: formData.assignedCourseIds || []
        };
        
        if (!isEdit) {
            payload.password = formData.password;
        }

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            
            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                onSuccess(true); 
            } else {
                setError(data.message || `Failed to ${isEdit ? 'update' : 'create'} lecturer.`);
            }

        } catch (err) {
            console.error("Save operation network error:", err);
            setError('Network error during save operation.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[1000] p-6 animate-in fade-in duration-300" onClick={() => onClose(false)}>
            <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden relative shadow-2xl flex flex-col transform transition-all animate-in zoom-in-95 duration-300 max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="bg-indigo-600 p-10 text-white relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-10 -translate-y-10 blur-3xl"></div>
                    <div className="relative z-10 flex justify-between items-end">
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black tracking-tight leading-none uppercase">{isEdit ? 'Edit Lecturer' : 'Register Lecturer'}</h2>
                            <p className="text-indigo-100/80 text-[10px] font-black uppercase tracking-[0.2em]">{isEdit ? 'Update details and courses' : 'Create new lecturer account'}</p>
                        </div>
                        <button onClick={() => onClose(false)} className="p-4 hover:bg-white/20 rounded-2xl transition-all active:scale-95 group">
                            <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>

                <div className="p-10 overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    placeholder="e.g. Dr. John Doe"
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
                                    required 
                                    disabled={isSaving} 
                                />
                            </div>

                            <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    placeholder="lecturer@lms.com"
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
                                    required 
                                    disabled={isSaving} 
                                />
                            </div>
                        </div>

                        {!isEdit && (
                            <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                                <input 
                                    type="password" 
                                    name="password" 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    placeholder="Minimum 6 characters"
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
                                    required={!isEdit} 
                                    minLength={6}
                                    disabled={isSaving} 
                                />
                            </div>
                        )}

                        <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assign Courses</label>
                            <div className="relative">
                                <select 
                                    name="assignedCourseIds" 
                                    multiple 
                                    value={formData.assignedCourseIds} 
                                    onChange={handleChange} 
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-[32px] outline-none transition-all font-bold text-gray-700 min-h-[160px] custom-scrollbar shadow-inner"
                                    disabled={isCoursesLoading || isSaving}
                                >
                                    {isCoursesLoading ? (
                                        <option disabled>Loading Courses...</option>
                                    ) : allCourses.length === 0 ? (
                                        <option disabled>No courses found</option>
                                    ) : (
                                        allCourses.map(course => (
                                            <option key={course.id} value={course.id} className="py-2 px-4 rounded-xl checked:bg-indigo-600 checked:text-white my-1 cursor-pointer">
                                                [{course.code}] {course.title}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                            <div className="flex justify-between items-center px-4 mt-2">
                                <p className="text-[9px] font-black text-gray-300 uppercase italic">Hold CTRL/CMD to select multiple</p>
                                <span className="text-[10px] font-black text-indigo-500 uppercase">{formData.assignedCourseIds.length} Courses Selected</span>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 shrink-0">
                            <button 
                                type="button" 
                                onClick={() => onClose(false)} 
                                className="flex-1 py-5 px-6 bg-gray-50 text-gray-400 font-black rounded-3xl hover:bg-gray-100 transition-colors uppercase tracking-widest text-[10px] border border-gray-200"
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={isSaving || isCoursesLoading}
                                className={`flex-[2] py-5 px-6 font-black rounded-3xl shadow-2xl transition-all transform active:scale-95 uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 ${isSaving ? 'bg-gray-200 text-gray-400' : 'bg-indigo-600 text-white hover:bg-black shadow-indigo-100 hover:shadow-black/20'}`}
                            >
                                {isSaving ? (
                                    <>
                                        Saving...
                                    </>
                                ) : (
                                    isEdit ? 'Save Changes' : 'Create Account'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AdminLecturerModal;