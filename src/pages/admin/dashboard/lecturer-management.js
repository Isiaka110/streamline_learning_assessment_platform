import React, { useState, useEffect } from 'react';
import { withAuthGuard } from '../../../../components/AuthGuard';
import { UserRole } from '@prisma/client';
import AdminLecturerTable from '../../../../components/AdminLecturerTable'; 
import AdminLecturerModal from '../../../../components/AdminLecturerModal'; 

function AdminLecturerManagement() {
    const [lecturers, setLecturers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLecturer, setCurrentLecturer] = useState(null); // Lecturer being edited/created

    const fetchLecturers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Hitting the new API route for lecturers
            const res = await fetch('/api/admin/lecturers'); 
            const data = await res.json();
            if (res.ok) {
                setLecturers(data.lecturers);
            } else {
                // Catches the "Access Denied" or other server-side errors
                setError(data.message || 'Failed to load lecturer data.'); 
            }
        } catch (err) {
            // Catches network errors
            setError('Network error while fetching lecturer data.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLecturers();
    }, []);

    const handleCreate = () => {
        setCurrentLecturer(null); // Null indicates creation mode
        setIsModalOpen(true);
    };

    const handleEdit = (lecturer) => {
        setCurrentLecturer(lecturer);
        setIsModalOpen(true);
    };

    const handleDelete = async (lecturerId) => {
        if (!window.confirm("Are you sure you want to delete this lecturer? This will affect their assigned courses.")) {
            return;
        }
        
        try {
            const res = await fetch(`/api/admin/lecturers/${lecturerId}`, { method: 'DELETE' });
            
            const data = await res.json();
            
            if (res.ok) {
                setLecturers(prevLecturers => prevLecturers.filter(l => l.id !== lecturerId));
                alert('✅ Lecturer successfully deleted.');
            } else {
                // ❌ Catches the "Failed to delete lecturer" error from the server
                alert(`❌ Error deleting lecturer: ${data.message || 'Deletion failed on the server.'}`);
            }
        } catch (err) {
            alert('❌ Network error during deletion.');
        }
    };

    const handleModalClose = (wasSuccessful) => {
        setIsModalOpen(false);
        setCurrentLecturer(null);
        if (wasSuccessful) {
            fetchLecturers(); // Refresh list on successful C or U operation
        }
    };

    if (isLoading) return <p style={styles.loading}>Loading Lecturer Management Data...</p>;
    if (error) return <p style={{ color: 'red', ...styles.message }}>Error: {error}</p>;

    return (
        <div style={styles.container}>
            <div style={styles.headerRow}>
                <h1 style={styles.header}>Lecturer Management 🧑‍🏫</h1>
                <button onClick={handleCreate} style={styles.createButton}>
                    + Create New Lecturer
                </button>
            </div>
            <p style={styles.subHeader}>View, create, edit, and delete lecturers.</p>

            {/* Assuming LecturerTable component exists and is imported */}
            <AdminLecturerTable 
                lecturers={lecturers} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
            />

            {/* Assuming LecturerModal component exists and is imported */}
            {isModalOpen && (
                <AdminLecturerModal 
                    lecturer={currentLecturer} // Null for create, object for edit
                    onClose={handleModalClose} 
                />
            )}
        </div>
    );
}

// Reusing styles from Course Management
const styles = {
    container: { padding: '30px', maxWidth: '1200px', margin: 'auto', fontFamily: 'Arial, sans-serif' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    header: { fontSize: '2em', color: '#1f2937' },
    subHeader: { color: '#6b7280', marginBottom: '25px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px' },
    createButton: { padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.2s' },
    loading: { textAlign: 'center', padding: '50px', fontSize: '1.2em', color: '#3b82f6' },
    message: { padding: '10px', backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '4px' }
};

export default withAuthGuard(AdminLecturerManagement, [UserRole.ADMIN]);