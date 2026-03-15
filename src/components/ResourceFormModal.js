// File: components/ResourceFormModal.js

import React, { useState, useEffect } from 'react';

function ResourceFormModal({ courseId, resource, onClose, onSuccess }) {
    const isEdit = !!resource;
    const [formData, setFormData] = useState({
        title: resource?.title || '',
        description: resource?.description || '',
    });
    const [file, setFile] = useState(null); 
    const [currentFileUrl, setCurrentFileUrl] = useState(resource?.filePath || ''); 
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData({
            title: resource?.title || '',
            description: resource?.description || '',
        });
        setCurrentFileUrl(resource?.filePath || '');
        setFile(null);
    }, [resource]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setError('');
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setError('');
        setFile(e.target.files[0]); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!formData.title) { setError('Title is required.'); return; }
        if (!isEdit && !file) { setError('A file must be selected for upload.'); return; }
        if (isEdit && !file && !currentFileUrl) { setError('Resource file information is missing.'); return; }

        setIsSaving(true);
        
        const formPayload = new FormData();
        formPayload.append('title', formData.title);
        formPayload.append('description', formData.description || '');
        
        if (file) {
            formPayload.append('file', file); 
        } 
        
        const method = isEdit ? 'PUT' : 'POST';
        let url;
        if (isEdit) {
            url = `/api/courses/${courseId}/resources/${resource.id}`; 
        } else {
            url = `/api/courses/${courseId}/resources`; 
        }

        try {
            const res = await fetch(url, {
                method,
                body: formPayload, 
            });
            
            const data = res.status !== 204 ? await res.json().catch(() => ({})) : {}; 

            if (res.ok) {
                onSuccess(); 
            } else {
                setError(data.message || `Failed to ${isEdit ? 'update' : 'upload'} resource.`);
            }

        } catch (err) {
            console.error("Save operation network error:", err);
            setError('Network error during save operation.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[1000] p-6 animate-in fade-in duration-300" onClick={onClose}>
            <div className="bg-white rounded-[40px] w-full max-w-xl overflow-hidden relative shadow-2xl flex flex-col transform transition-all animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                <div className="bg-indigo-600 p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-10 -translate-y-10 blur-3xl"></div>
                    <div className="relative z-10">
                        <h2 className="text-4xl font-black tracking-tight leading-none mb-2">{isEdit ? 'Edit Resource' : 'Upload Resource'}</h2>
                        <p className="text-indigo-100/80 text-sm font-black uppercase tracking-widest">{isEdit ? 'Update resource details' : 'Upload new course material'}</p>
                    </div>
                    <button onClick={onClose} className="absolute top-8 right-8 p-3 hover:bg-white/20 rounded-2xl transition-colors text-white active:scale-95 group">
                        <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="p-10">
                    {error && (
                        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Resource Title</label>
                            <input 
                                type="text" 
                                name="title" 
                                value={formData.title} 
                                onChange={handleChange} 
                                placeholder="e.g. System Dynamics Syllabus"
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
                                required 
                                disabled={isSaving} 
                            />
                        </div>

                        <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{isEdit ? 'Replace File (Optional)' : 'Select File'}</label>
                            <div className="relative group/file">
                                <input 
                                    type="file" 
                                    onChange={handleFileChange} 
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-4 file:px-8 file:rounded-2xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition-all cursor-pointer bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-2"
                                    required={!isEdit && !currentFileUrl} 
                                    disabled={isSaving} 
                                />
                                {isEdit && currentFileUrl && (
                                    <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active: {currentFileUrl.split('/').pop()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description (Optional)</label>
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange} 
                                placeholder="Define the core purpose and utility of this artifact..."
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-medium text-gray-700 min-h-[120px] resize-none placeholder:text-gray-300 shadow-inner"
                                disabled={isSaving} 
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button 
                                type="button" 
                                onClick={onClose} 
                                className="flex-1 py-5 px-6 bg-gray-50 text-gray-400 font-black rounded-3xl hover:bg-gray-100 transition-colors uppercase tracking-widest text-[10px] border border-gray-200"
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className={`flex-[2] py-5 px-6 font-black rounded-3xl shadow-2xl transition-all transform active:scale-95 uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 ${isSaving ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-black shadow-indigo-100 hover:shadow-black/20'}`}
                            >
                                {isSaving ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Processing...
                                    </>
                                ) : (
                                    isEdit ? 'Save' : 'Upload'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ResourceFormModal;