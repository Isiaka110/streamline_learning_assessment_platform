import React, { useState, useEffect } from 'react';

function AdminCourseModal({ course, onClose, onSuccess }) {
    const isEdit = !!course; 
    const currentYear = new Date().getFullYear().toString(); 

    const [formData, setFormData] = useState({
        code: course?.code || '',
        title: course?.title || '',
        semester: course?.semester || '', 
        year: course?.year || currentYear, 
        description: course?.description || '',
        assignedLecturerIds: course?.lecturers?.map(lec => lec.id) || [], 
    });
    
    const [allLecturers, setAllLecturers] = useState([]); 
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLecturersLoading, setIsLecturersLoading] = useState(true);

    useEffect(() => {
        const fetchLecturers = async () => {
            setIsLecturersLoading(true);
            setError('');
            try {
                const res = await fetch('/api/admin/lecturers'); 
                const data = await res.json();

                if (res.ok) {
                    setAllLecturers(data.lecturers || []);
                } else {
                    setError(data.message || 'Failed to load lecturers.');
                }
            } catch (err) {
                setError('Network error while loading lecturers.');
            } finally {
                setIsLecturersLoading(false);
            }
        };

        fetchLecturers();
    }, []); 

    const handleChange = (e) => {
        const { name, value, options, type } = e.target;
        setError(''); 

        if (type === 'select-multiple') {
            const selectedOptions = Array.from(options).filter(option => option.selected).map(option => option.value);
            setFormData({ ...formData, [name]: selectedOptions });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!formData.code || !formData.title || !formData.semester || !formData.year) {
            setError('Course Code, Title, Semester, and Year are required.');
            return;
        }

        setIsSaving(true);

        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `/api/admin/courses/${course.id}` : '/api/admin/courses';

        const payload = {
            code: formData.code.trim(), 
            title: formData.title.trim(),
            semester: formData.semester,
            year: formData.year,
            description: formData.description.trim(),
            lecturerIds: formData.assignedLecturerIds 
        };

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
                setError(data.message || `Failed to ${isEdit ? 'update' : 'create'} course.`);
            }

        } catch (err) {
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
                            <h2 className="text-4xl font-black tracking-tight leading-none uppercase">{isEdit ? 'Edit Course' : 'Create Course'}</h2>
                            <p className="text-indigo-100/80 text-[10px] font-black uppercase tracking-[0.2em]">{isEdit ? 'Update course details' : 'Add a new course to the catalog'}</p>
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
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Course Code</label>
                                <input 
                                    type="text" 
                                    name="code" 
                                    value={formData.code} 
                                    onChange={handleChange} 
                                    placeholder="e.g. CSC399"
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
                                    required 
                                    disabled={isSaving} 
                                />
                            </div>

                            <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Course Title</label>
                                <input 
                                    type="text" 
                                    name="title" 
                                    value={formData.title} 
                                    onChange={handleChange} 
                                    placeholder="e.g. Advanced System Architecture"
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
                                    required 
                                    disabled={isSaving} 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Semester</label>
                                <select
                                    name="semester"
                                    value={formData.semester}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-bold text-gray-700 appearance-none cursor-pointer"
                                    required
                                    disabled={isSaving}
                                >
                                    <option value="">Select Semester</option>
                                    <option value="FIRST">1st Semester</option>
                                    <option value="SECOND">2nd Semester</option>
                                </select>
                            </div>

                            <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Year</label>
                                <input 
                                    type="number" 
                                    name="year" 
                                    value={formData.year} 
                                    onChange={handleChange} 
                                    style={{WebkitAppearance: 'none'}}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-bold text-gray-700"
                                    placeholder="e.g. 2024"
                                    min="2000" 
                                    max={parseInt(currentYear) + 1}
                                    required
                                    disabled={isSaving}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description (Optional)</label>
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange} 
                                placeholder="Provide a brief overview of the course..."
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-medium text-gray-700 min-h-[120px] resize-none placeholder:text-gray-300 shadow-inner"
                                disabled={isSaving} 
                            />
                        </div>

                        <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assign Lecturers</label>
                            <div className="relative">
                                <select 
                                    name="assignedLecturerIds" 
                                    multiple 
                                    value={formData.assignedLecturerIds} 
                                    onChange={handleChange} 
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-[32px] outline-none transition-all font-bold text-gray-700 min-h-[160px] custom-scrollbar shadow-inner"
                                    disabled={isLecturersLoading || isSaving}
                                >
                                    {isLecturersLoading ? (
                                        <option disabled>Loading Lecturers...</option>
                                    ) : allLecturers.length === 0 ? (
                                        <option disabled>No lecturers found</option>
                                    ) : (
                                        allLecturers.map(lec => (
                                            <option key={lec.id} value={lec.id} className="py-2 px-4 rounded-xl checked:bg-indigo-600 checked:text-white my-1 cursor-pointer">
                                                {lec.name} ({lec.email})
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                            <div className="flex justify-between items-center px-4 mt-2">
                                <p className="text-[9px] font-black text-gray-300 uppercase italic">Hold CTRL/CMD to select multiple</p>
                                <span className="text-[10px] font-black text-indigo-500 uppercase">{formData.assignedLecturerIds.length} Lecturers Selected</span>
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
                                disabled={isSaving}
                                className={`flex-[2] py-5 px-6 font-black rounded-3xl shadow-2xl transition-all transform active:scale-95 uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 ${isSaving ? 'bg-gray-200 text-gray-400' : 'bg-indigo-600 text-white hover:bg-black shadow-indigo-100 hover:shadow-black/20'}`}
                            >
                                {isSaving ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Syncing Domain...
                                    </>
                                ) : (
                                    isEdit ? 'Save Changes' : 'Create Course'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AdminCourseModal;