// File: components/ResourceManager.js

import React, { useState, useEffect, useCallback } from 'react';
import ResourceList from './ResourceList'; 
import ResourceFormModal from './ResourceFormModal'; 

const ResourceManager = ({ courseId, courseCode }) => {
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState(null);

    const fetchResources = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        if (!courseId) {
            setResources([]);
            setIsLoading(false);
            return;
        }
        try {
            const res = await fetch(`/api/courses/${courseId}/resources`);
            
            if (res.status === 404) {
                 setResources([]); 
                 setIsLoading(false);
                 return;
            }

            const data = await res.json();
            
            if (res.ok) {
                setResources(Array.isArray(data.resources) ? data.resources : []);
            } else {
                setError(data.message || 'Failed to load course resources.');
            }
        } catch (err) {
            console.error('Fetch Resources Error:', err);
            setError('Network error while fetching resources.');
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    const handleCreate = () => {
        setEditingResource(null); 
        setIsModalOpen(true);
    };

    const handleEdit = (resource) => {
        setEditingResource(resource); 
        setIsModalOpen(true);
    };

    const handleDelete = async (resourceId, title) => {
        if (!window.confirm(`Are you sure you want to delete the resource: "${title}"? This action cannot be undone.`)) {
            return;
        }

        setError(null);
        try {
            const res = await fetch(`/api/courses/${courseId}/resources/${resourceId}`, {
                method: 'DELETE',
            });

            if (res.status === 204 || res.ok) {
                fetchResources(); 
            } else {
                const data = await res.json().catch(() => ({}));
                setError(data.message || 'Failed to delete dynamic asset.');
            }
        } catch (err) {
            console.error('Delete Resource Error:', err);
            setError('Network error during deletion.');
        }
    };

    const handleSuccess = () => {
        setIsModalOpen(false); 
        fetchResources(); 
    };

    return (
        <div className="bg-white rounded-[40px] shadow-2xl shadow-indigo-100/50 border border-gray-100 overflow-hidden animate-in fade-in duration-700">
            <div className="bg-gray-900 p-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full -translate-x-20 -translate-y-20 blur-3xl"></div>
                <div className="relative z-10 space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 italic">Sector Asset Inventory</span>
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic italic-shadow">
                        Material Repository <span className="text-indigo-500">[{courseCode}]</span>
                    </h2>
                </div>
                <button 
                    onClick={handleCreate} 
                    className="relative z-10 px-8 py-4 bg-indigo-600 hover:bg-white hover:text-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-900/20 transition-all transform active:scale-95 flex items-center gap-3 uppercase tracking-widest text-[10px] group"
                >
                    <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                    Inject New Asset
                </button>
            </div>
            
            <div className="p-10">
                <ResourceList 
                    resources={resources} 
                    isLoading={isLoading} 
                    error={error} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                />
            </div>

            {isModalOpen && (
                <ResourceFormModal 
                    courseId={courseId}
                    resource={editingResource} 
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
};

export default ResourceManager;