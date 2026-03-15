// components/ResourceUploadForm.js

import React, { useState, useEffect } from 'react';

// NOTE: This modal currently assumes a file path (URL/string) is provided.
function ResourceUploadForm({ courseId, resource, onClose, onSuccess }) {
    const isEdit = !!resource;

    const [formData, setFormData] = useState({
        title: resource?.title || '',
        filePath: resource?.filePath || '',
        description: resource?.description || '',
    });
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData({
            title: resource?.title || '',
            filePath: resource?.filePath || '',
            description: resource?.description || '',
        });
    }, [resource]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setError('');
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!formData.title || !formData.filePath) {
            setError('Title and File Path/URL are required.');
            return;
        }

        setIsSaving(true);

        const method = isEdit ? 'PUT' : 'POST';
        const url = '/api/lecturer/resources'; 
        
        const payload = isEdit 
            ? { resourceId: resource.id, ...formData }
            : { ...formData, courseId };

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            
            const data = await res.json();

            if (res.ok) {
                onSuccess(); // Close modal and refresh list
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-[1000] animate-in fade-in duration-300" onClick={onClose}>
            <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden relative shadow-2xl flex flex-col transform transition-all animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-10 -translate-y-10 blur-2xl"></div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black tracking-tight leading-loose ">{isEdit ? 'Refine Resource' : 'Deploy Resource'}</h2>
                        <p className="text-indigo-100/80 text-xs font-bold uppercase tracking-widest">{isEdit ? 'Update existing artifact' : 'Upload new course material'}</p>
                    </div>
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-xl transition-colors text-white active:scale-90">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Artifact Designation</label>
                            <input 
                                type="text" 
                                name="title" 
                                value={formData.title} 
                                onChange={handleChange} 
                                placeholder="e.g. System Dynamics v1.2"
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
                                required 
                            />
                        </div>

                        <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Remote Access URL</label>
                            <input 
                                type="url" 
                                name="filePath" 
                                value={formData.filePath} 
                                onChange={handleChange} 
                                placeholder="https://cdn.example.com/asset.pdf"
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
                                required 
                            />
                        </div>

                        <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Context Notes</label>
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange} 
                                placeholder="Core concepts and prerequisites..."
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-medium text-gray-700 min-h-[100px] resize-none placeholder:text-gray-300"
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button 
                                type="button" 
                                onClick={onClose} 
                                disabled={isSaving}
                                className="flex-1 py-4 px-6 bg-gray-50 text-gray-400 font-black rounded-2xl hover:bg-gray-100 transition-colors uppercase tracking-widest text-[10px] border border-gray-200"
                            >
                                Abort
                            </button>
                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className="flex-[2] py-4 px-6 bg-indigo-600 text-white font-black rounded-2xl hover:bg-black shadow-xl shadow-indigo-100 hover:shadow-black/20 transition-all transform active:scale-95 uppercase tracking-widest text-[10px]"
                            >
                                {isSaving ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Processing...
                                    </span>
                                ) : (
                                    isEdit ? 'Sync Artifact' : 'Commit Resource'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ResourceUploadForm;