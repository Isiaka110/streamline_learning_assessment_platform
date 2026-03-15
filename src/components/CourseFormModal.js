import React, { useState, useEffect, useCallback } from 'react';

const SEMESTERS = ['First Semester', 'Second Semester'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR + 2 - i); 

const CourseFormModal = ({ course, onClose, onSuccess }) => {
    const isEdit = !!course && !!course.id; 
    const initialLecturerId = course?.lecturers?.[0]?.id || ''; 
    
    const [formData, setFormData] = useState({
        title: course?.title || '',
        code: course?.code || course?.courseCode || '', 
        description: course?.description || '', 
        semester: course?.semester || SEMESTERS[0], 
        year: course?.year?.toString() || CURRENT_YEAR.toString(), 
        lecturerId: initialLecturerId, 
    });
    
    const [allLecturers, setAllLecturers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState(null);

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

    const handleChange = (e) => {
        const { name, value } = e.target; 
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFormError(null);

        if (!formData.title || !formData.code || !formData.semester || !formData.year) {
            setFormError("Missing required course fields (Title, Code, Semester, Year).");
            setLoading(false);
            return;
        }

        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `/api/admin/courses/${course.id}` : '/api/admin/courses';
        
        const payload = {
            courseCode: formData.code, 
            title: formData.title,
            description: formData.description === '' ? null : formData.description,
            semester: formData.semester, 
            year: parseInt(formData.year), 
            lecturerIds: formData.lecturerId ? [formData.lecturerId] : [], 
        };
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                setFormError(errorData.message || `Failed to ${isEdit ? 'update' : 'create'} course.`);
                setLoading(false);
                return;
            }

            onSuccess(true);
        } catch (err) {
            setFormError('Network error during form submission.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[1000] p-6 animate-in fade-in duration-300" onClick={onClose}>
            <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden relative shadow-2xl flex flex-col transform transition-all animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                <div className="bg-indigo-600 p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-20 -translate-y-20 blur-3xl"></div>
                    <div className="relative z-10">
                        <h2 className="text-4xl font-black tracking-tight leading-none mb-2">{isEdit ? 'Edit Course' : 'Create Course'}</h2>
                        <p className="text-indigo-100/80 text-sm font-black uppercase tracking-widest">{isEdit ? 'Update course details' : 'Add a new course to the curriculum'}</p>
                    </div>
                </div>

                <div className="p-10">
                    {formError && (
                        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                            {formError}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2 focus-within:translate-x-1 transition-transform">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Course Title</label>
                                <input 
                                    type="text" 
                                    name="title" 
                                    value={formData.title} 
                                    onChange={handleChange} 
                                    placeholder="e.g. Advanced System Design"
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
                                    disabled={loading} 
                                    required 
                                />
                            </div>
                            
                            <div className="space-y-2 focus-within:translate-x-1 transition-transform">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Course Code</label>
                                <input 
                                    type="text" 
                                    name="code" 
                                    value={formData.code} 
                                    onChange={handleChange} 
                                    placeholder="e.g. CS-909"
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading || isEdit} 
                                    required 
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2 focus-within:translate-x-1 transition-transform">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Semester</label>
                                <select
                                    name="semester"
                                    value={formData.semester}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-bold text-gray-700 appearance-none cursor-pointer"
                                    disabled={loading}
                                    required
                                >
                                    {SEMESTERS.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2 focus-within:translate-x-1 transition-transform">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Year</label>
                                <select
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-bold text-gray-700 appearance-none cursor-pointer"
                                    disabled={loading}
                                    required
                                >
                                    {YEARS.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2 focus-within:translate-x-1 transition-transform">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assign Lecturer</label>
                            <select
                                name="lecturerId"
                                value={formData.lecturerId}
                                onChange={handleChange} 
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-bold text-gray-700 appearance-none cursor-pointer"
                                disabled={loading}
                            >
                                {loading && allLecturers.length === 0 && <option value="">Accessing Personnel Database...</option>}
                                {!loading && allLecturers.length <= 1 && <option value="">No Operatives Available</option>} 
                                
                                {allLecturers.map(lecturer => (
                                    <option key={lecturer.id} value={lecturer.id}>
                                        {lecturer.name} {lecturer.id !== '' && `— [${lecturer.email}]`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2 focus-within:translate-x-1 transition-transform">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description (Optional)</label>
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange} 
                                placeholder="Provide a brief overview of the course..."
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-medium text-gray-700 min-h-[120px] resize-none placeholder:text-gray-300"
                                disabled={loading} 
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button 
                                type="button"
                                onClick={onClose} 
                                className="flex-1 py-5 px-6 bg-gray-50 text-gray-400 font-black rounded-3xl hover:bg-gray-100 transition-colors uppercase tracking-widest text-[10px] border border-gray-200"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="flex-[2] py-5 px-6 bg-indigo-600 text-white font-black rounded-3xl hover:bg-black shadow-2xl shadow-indigo-100 hover:shadow-black/20 transition-all transform active:scale-95 uppercase tracking-widest text-[10px]"
                            >
                                {loading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Course')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CourseFormModal;