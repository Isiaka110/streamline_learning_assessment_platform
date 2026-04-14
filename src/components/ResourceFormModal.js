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
        if (!isEdit && !file) { setError('Please select a file to upload.'); return; }

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
                setError(data.message || `Failed to ${isEdit ? 'update' : 'upload'} file.`);
            }

        } catch (err) {
            console.error("Save operation network error:", err);
            setError('Could not connect to the server.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[1000] p-4 sm:p-6 animate-in fade-in duration-300" onClick={onClose}>
            <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden relative shadow-2xl flex flex-col transform transition-all animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                <div className="bg-primary p-8 text-white relative flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{isEdit ? 'Edit File' : 'Upload File'}</h2>
                        <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">{isEdit ? 'Update file details' : 'Share a new material with the class'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground ml-1 uppercase tracking-wider">File Title</label>
                            <input 
                                type="text" 
                                name="title" 
                                value={formData.title} 
                                onChange={handleChange} 
                                placeholder="e.g. Week 1 Syllabus"
                                className="w-full px-5 py-3 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-semibold"
                                required 
                                disabled={isSaving} 
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground ml-1 uppercase tracking-wider">{isEdit ? 'Replace File (Optional)' : 'Select File'}</label>
                            <div className="border-2 border-dashed border-border p-8 rounded-xl text-center hover:border-primary transition-all relative">
                                <input 
                                    type="file" 
                                    onChange={handleFileChange} 
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    required={!isEdit && !currentFileUrl} 
                                    disabled={isSaving} 
                                />
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-secondary">
                                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                                    </div>
                                    <span className="text-foreground font-bold text-xs uppercase tracking-wider">Click to choose a file</span>
                                </div>
                            </div>
                            {isEdit && currentFileUrl && (
                                <div className="mt-2 text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Current: {currentFileUrl.split('/').pop()}
                                </div>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground ml-1 uppercase tracking-wider">Description (Optional)</label>
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange} 
                                placeholder="What is this file about?"
                                className="w-full px-5 py-3 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-semibold min-h-[100px] resize-none"
                                disabled={isSaving} 
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button 
                                type="button" 
                                onClick={onClose} 
                                className="flex-1 btn-outline py-4 text-xs"
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className="flex-[2] btn-primary py-4 text-xs"
                            >
                                {isSaving ? 'Uploading...' : (isEdit ? 'Save Changes' : 'Upload File')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ResourceFormModal;