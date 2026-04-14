// components/ResourceManager.js

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
                setError(data.message || 'Could not load class resources.');
            }
        } catch (err) {
            console.error('Fetch Resources Error:', err);
            setError('Could not connect. Please check your internet.');
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
        if (!window.confirm(`Are you sure you want to delete: "${title}"?`)) {
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
                setError(data.message || 'Failed to delete file.');
            }
        } catch (err) {
            console.error('Delete Resource Error:', err);
            setError('Could not delete file.');
        }
    };

    const handleSuccess = () => {
        setIsModalOpen(false); 
        fetchResources(); 
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-[2rem] border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Share Files</p>
                    <h2 className="text-3xl font-bold text-foreground tracking-tight">
                        Class Files for {courseCode}
                    </h2>
                </div>
                <button 
                    onClick={handleCreate} 
                    className="btn-primary w-full md:w-auto"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Upload New File
                </button>
            </div>
            
            <div className="bg-white p-8 rounded-[2rem] border border-border shadow-sm">
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