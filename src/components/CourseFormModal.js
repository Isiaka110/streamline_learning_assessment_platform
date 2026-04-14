import React, { useState, useEffect, useCallback } from 'react';

const SEMESTERS = ['First Semester', 'Second Semester'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR + 1 - i); 

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
                    { id: '', name: 'Keep Unassigned', email: '' }, 
                    ...lecturerData
                ]);
            } else {
                setFormError(data.message || 'Failed to load teacher data.');
            }
        } catch (err) {
            setFormError('Network error loading teachers.');
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

        if (!formData.title || !formData.code) {
            setFormError("Class Title and Code are required.");
            setLoading(false);
            return;
        }

        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `/api/admin/courses/${course.id}` : '/api/admin/courses';
        
        const payload = {
            courseCode: formData.code.trim().toUpperCase(), 
            title: formData.title.trim(),
            description: formData.description === '' ? null : formData.description.trim(),
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
                setFormError(errorData.message || `Failed to ${isEdit ? 'update' : 'create'} class.`);
                setLoading(false);
                return;
            }
            onSuccess(true);
        } catch (err) {
            setFormError('Network error. Transaction failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[1000] p-4" onClick={onClose}>
            <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden relative shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="bg-primary p-8 text-white relative flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{isEdit ? 'Edit Class' : 'Create Class'}</h2>
                        <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">{isEdit ? 'Update settings' : 'Deploy new curriculum'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="p-8 overflow-y-auto">
                    {formError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold text-center">
                            {formError}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-foreground ml-1 uppercase tracking-wider">Class Title</label>
                                <input 
                                    type="text" 
                                    name="title" 
                                    value={formData.title} 
                                    onChange={handleChange} 
                                    placeholder="e.g. Modern Physics"
                                    className="w-full px-5 py-3 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-semibold"
                                    disabled={loading} 
                                    required 
                                />
                            </div>
                            
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-foreground ml-1 uppercase tracking-wider">Class Code</label>
                                <input 
                                    type="text" 
                                    name="code" 
                                    value={formData.code} 
                                    onChange={handleChange} 
                                    placeholder="e.g. PHY201"
                                    className="w-full px-5 py-3 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-bold text-primary disabled:bg-gray-50"
                                    disabled={loading || isEdit} 
                                    required 
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-foreground ml-1 uppercase tracking-wider">Semester</label>
                                <select
                                    name="semester"
                                    value={formData.semester}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-semibold bg-white"
                                    disabled={loading}
                                    required
                                >
                                    {SEMESTERS.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-foreground ml-1 uppercase tracking-wider">Session Year</label>
                                <select
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-semibold bg-white"
                                    disabled={loading}
                                    required
                                >
                                    {YEARS.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground ml-1 uppercase tracking-wider">Assign Primary Teacher</label>
                            <select
                                name="lecturerId"
                                value={formData.lecturerId}
                                onChange={handleChange} 
                                className="w-full px-5 py-3 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-bold text-secondary bg-white"
                                disabled={loading}
                            >
                                {allLecturers.map(lecturer => (
                                    <option key={lecturer.id} value={lecturer.id}>
                                        {lecturer.name} {lecturer.id !== '' && `(${lecturer.email.substring(0, 10)}...)`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground ml-1 uppercase tracking-wider">Description (Optional)</label>
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange} 
                                placeholder="Details about this class..."
                                className="w-full px-5 py-3 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-semibold min-h-[100px] resize-none"
                                disabled={loading} 
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button 
                                type="button"
                                onClick={onClose} 
                                className="flex-1 btn-outline py-4 text-xs"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="flex-[2] btn-primary py-4 text-xs"
                            >
                                {loading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Deploy Class')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CourseFormModal;