// File: components/ResourceManager.js

import React, { useState, useEffect, useCallback } from 'react';
import ResourceList from './ResourceList'; // Import the new ResourceList
import ResourceFormModal from './ResourceFormModal'; // 🔑 CORRECTED IMPORT NAME

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
            // ✅ FIX: Use the correct dynamic API path for GET
            // Path: /api/courses/[courseId]/resources
            const res = await fetch(`/api/courses/${courseId}/resources`);
            
            if (res.status === 404) {
                 // Handle 404 gracefully if no resources/course found, but still set loading=false
                 setResources([]); 
                 setIsLoading(false);
                 return;
            }

            const data = await res.json();
            
            if (res.ok) {
                // Ensure data.resources is an array
                setResources(Array.isArray(data.resources) ? data.resources : []);
            } else {
                // This captures authorization or other backend errors
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
        setEditingResource(null); // Clear any existing resource for a new creation
        setIsModalOpen(true);
    };

    const handleEdit = (resource) => {
        setEditingResource(resource); // Set the resource to be edited
        setIsModalOpen(true);
    };

    const handleDelete = async (resourceId, title) => {
        if (!window.confirm(`Are you sure you want to delete the resource: "${title}"? This action cannot be undone.`)) {
            return;
        }

        setError(null);
        try {
            // ✅ FIX: Use the correct dynamic API path for DELETE
            // Path: /api/courses/[courseId]/resources/[resourceId]
            const res = await fetch(`/api/courses/${courseId}/resources/${resourceId}`, {
                method: 'DELETE',
            });

            if (res.status === 204 || res.ok) { // 204 is common for successful delete (No Content)
                alert('Resource deleted successfully.');
                fetchResources(); // Refresh list
            } else {
                const data = await res.json().catch(() => ({}));
                setError(data.message || 'Failed to delete resource.');
            }
        } catch (err) {
            console.error('Delete Resource Error:', err);
            setError('Network error during deletion.');
        }
    };

    const handleSuccess = () => {
        setIsModalOpen(false); // Close the modal
        fetchResources(); // Refresh the list
    };

    const styles = {
        container: { padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
        headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
        createButton: { padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
        title: { fontSize: '1.8em', color: '#1f2937' },
        info: { padding: '15px', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', textAlign: 'center' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.headerRow}>
                <h2 style={styles.title}>Resources for {courseCode}</h2>
                <button onClick={handleCreate} style={styles.createButton}>
                    + Upload New Resource
                </button>
            </div>
            
            <ResourceList 
                resources={resources} 
                isLoading={isLoading} 
                error={error} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
            />

            {isModalOpen && (
                <ResourceFormModal // 🔑 CORRECTED COMPONENT NAME
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