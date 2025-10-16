// pages/dashboard/admin/lecturer-management.js

import React, { useState, useEffect, useCallback } from 'react';
import { withAuthGuard } from '../../../../components/AuthGuard';
import { UserRole } from '@prisma/client';
import AdminLecturerTable from '../../../../components/AdminLecturerTable'; 
import AdminLecturerModal from '../../../../components/AdminLecturerModal'; 
import LogoContainer from '../../../../components/LogoContainer';

function AdminLecturerManagement() {
    const [lecturers, setLecturers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLecturer, setCurrentLecturer] = useState(null); 

    const fetchLecturers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/lecturers');
            const data = await res.json();
            if (res.ok) {
                setLecturers(data.lecturers || []);
            } else {
                setError(data.message || `Failed to load lecturer data. Status: ${res.status}`);
            }
        } catch (err) {
            console.error("Network or parsing error:", err);
            setError('Network error while fetching data. Check server connection.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLecturers();
    }, [fetchLecturers]);

    const handleEdit = (lecturer) => {
        setCurrentLecturer(lecturer);
        setIsModalOpen(true);
    };

    const handleDelete = async (lecturerId, lecturerName) => {
        if (!window.confirm(`Are you sure you want to delete lecturer '${lecturerName}'? This action is permanent and will unassign all their courses.`)) {
            return;
        }
        
        setIsLoading(true); 
        setError(null);
        
        try {
            const res = await fetch(`/api/admin/lecturers/${lecturerId}`, { method: 'DELETE' });
            
            if (res.ok) {
                alert(`✅ Lecturer account '${lecturerName}' successfully deleted.`);
                fetchLecturers(); 
            } else {
                const data = await res.json();
                setError(data.message || `Failed to delete lecturer. Status: ${res.status}`);
                alert(`❌ Error deleting lecturer: ${data.message || 'Deletion failed on the server.'}`);
            }
        } catch (err) {
            console.error("Deletion error:", err);
            setError('Network error during deletion.');
            alert('❌ Network error during deletion. Check your connection.');
        } finally {
            if (!res?.ok) setIsLoading(false); 
        }
    };
    
    // Use useCallback for handleModalClose to ensure stability, though not strictly required here, it's good practice.
    const handleModalClose = useCallback((wasSuccessful) => {
        setIsModalOpen(false);
        setCurrentLecturer(null);
        if (wasSuccessful) {
            fetchLecturers(); // Refresh list if a successful update or creation happened
        }
    }, [fetchLecturers]); 

    const handleCreateNew = () => {
        setCurrentLecturer(null); 
        setIsModalOpen(true);
    };

    if (isLoading) return <p style={styles.loading}>Loading Lecturer Data...</p>;
    if (error) return <p style={{ ...styles.message, color: 'red' }}>Error: {error}</p>;

    return (
        <div style={styles.container}>
            <div style={styles.brandingArea}> 
            <LogoContainer/> <span style={styles.abbreviation}>LMS</span> 
            </div>
            <div style={styles.headerRow}>
                <h1 style={styles.header}>Lecturer Management 👥</h1>
                <button onClick={handleCreateNew} style={styles.createButton}>
                    + Register New Lecturer
                </button>
            </div>
            <p style={styles.subHeader}>View, edit, or delete Lecturer accounts and their course assignments.</p>

            <AdminLecturerTable 
                lecturers={lecturers} 
                onEdit={handleEdit} 
                onDelete={handleDelete} // Pass the handler
            />

            {isModalOpen && (
                <AdminLecturerModal 
                    lecturer={currentLecturer} 
                    onClose={() => handleModalClose(false)} // Pass specific close handler
                    // 🔑 Correction: Explicitly define the success callback function
                    onSuccess={() => handleModalClose(true)} 
                />
            )}
        </div>
    );
}

export default withAuthGuard(AdminLecturerManagement, [UserRole.ADMIN]);

const styles = {
    container: { padding: '30px', maxWidth: '1200px', margin: 'auto', fontFamily: 'Arial, sans-serif' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    brandingArea: { display: 'flex', alignItems: 'center' },
    abbreviation: { fontSize: '1.5em', fontWeight: '900', color: '#4f46e5', marginRight: '15px', marginLeft: '10px', letterSpacing: '1px', flexShrink: 0, lineHeight: '1', paddingTop: '2px' },
    header: { fontSize: '2em', color: '#1f2937' },
    subHeader: { color: '#6b7280', marginBottom: '25px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px' },
    createButton: { padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.2s' },
    loading: { textAlign: 'center', padding: '50px', fontSize: '1.2em', color: '#3b82f6' },
    message: { padding: '10px', backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '4px' }
};