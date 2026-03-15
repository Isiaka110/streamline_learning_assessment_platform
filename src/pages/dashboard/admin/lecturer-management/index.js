import React, { useState, useEffect } from 'react';
import { withAuthGuard } from '@components/AuthGuard'; 
import { UserRole } from '@prisma/client'; 
import AdminLecturerTable from '@components/AdminLecturerTable'; 
import AdminLecturerModal from '@components/AdminLecturerModal'; 
import LogoContainer from '@components/LogoContainer'; 

function AdminLecturerManagement() {
    const [lecturers, setLecturers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLecturer, setCurrentLecturer] = useState(null); 

    const fetchLecturers = async () => {
        setIsLoading(true);
        setError(null); 
        try {
            const res = await fetch('/api/admin/lecturers');
            const data = await res.json();

            if (res.ok) {
                if (Array.isArray(data)) {
                    setLecturers(data);
                } else {
                    console.error("API response for lecturers was not an array:", data);
                    setError("Received unexpected data format from the server.");
                    setLecturers([]); 
                }
            } else {
                setError(data.message || 'Failed to load lecturer data.');
            }
        } catch (err) {
            console.error("Fetch Lecturers Network Error:", err);
            setError('Network error while fetching data. Please check your connection.');
        } finally {
            setIsLoading(false); 
        }
    };

    useEffect(() => {
        fetchLecturers();
    }, []);

    const handleEdit = (lecturer) => {
        setCurrentLecturer(lecturer);
        setIsModalOpen(true);
    };

    const handleCreateNew = () => {
        setCurrentLecturer(null); 
        setIsModalOpen(true);
    };

    const handleDelete = async (lecturerId) => {
        if (!window.confirm("Are you sure you want to delete this lecturer? This action is permanent and will unassign all their courses.")) {
            return;
        }
        
        setError(null);
        
        try {
            const res = await fetch(`/api/admin/lecturers/${lecturerId}`, { 
                method: 'DELETE' 
            });
            
            if (res.ok) {
                setLecturers(prevLecturers => 
                    prevLecturers.filter(l => l.id !== lecturerId)
                );
                alert('✅ Lecturer account successfully deleted.');
            } else {
                const data = await res.json();
                setError(data.message || `Failed to delete lecturer. Status: ${res.status}`);
                alert(`❌ Error deleting lecturer: ${data.message || 'Deletion failed on the server.'}`);
            }
        } catch (err) {
            console.error("Deletion network error:", err);
            setError('Network error during deletion.');
            alert('❌ Network error during deletion. Check your connection.');
        }
    };
    
    const handleModalClose = (wasSuccessful) => {
        setIsModalOpen(false);
        setCurrentLecturer(null); 
        if (wasSuccessful) {
            fetchLecturers(); 
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><p className="text-xl font-semibold text-blue-600 animate-pulse">Loading Lecturer Data...</p></div>;
    }
    if (error) {
        return <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded max-w-2xl mx-auto mt-10 text-center"><p>Error: {error}</p></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <LogoContainer />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 mt-4">Lecturer Management 👥</h1>
            <p className="text-gray-600 mb-8 border-b border-gray-200 pb-4">View, edit, or delete Lecturer accounts and their course assignments.</p>

            <div className="flex justify-end mb-6">
                <button 
                    onClick={handleCreateNew} 
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg shadow-md transition-colors"
                >
                    + Register New Lecturer
                </button>
            </div>

            <AdminLecturerTable 
                lecturers={lecturers} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
            />

            {isModalOpen && (
                <AdminLecturerModal 
                    lecturer={currentLecturer} 
                    onClose={() => handleModalClose(false)} 
                    onSuccess={() => handleModalClose(true)} 
                />
            )}
        </div>
    );
}

export default withAuthGuard(AdminLecturerManagement, [UserRole.ADMIN]);