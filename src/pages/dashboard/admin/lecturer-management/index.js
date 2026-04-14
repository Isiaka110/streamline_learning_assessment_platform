import React, { useState, useEffect } from 'react';
import { withAuthGuard } from '@components/AuthGuard'; 
import { UserRole } from '@prisma/client'; 
import AdminLecturerTable from '@components/AdminLecturerTable'; 
import AdminLecturerModal from '@components/AdminLecturerModal'; 
import LogoContainer from '@components/LogoContainer'; 
import Head from 'next/head';

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
                    setError("Received unexpected data format from the server.");
                    setLecturers([]); 
                }
            } else {
                setError(data.message || 'Failed to load teacher data.');
            }
        } catch (err) {
            console.error("Fetch Lecturers Network Error:", err);
            setError('Could not connect. Please check your internet.');
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
        if (!window.confirm("Are you sure you want to delete this teacher? This will unassign all their classes.")) {
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
            } else {
                const data = await res.json();
                alert(`Error: ${data.message || 'Deletion failed.'}`);
            }
        } catch (err) {
            alert('Error: Could not delete teacher.');
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
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm font-bold text-primary">Loading teacher data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <Head>
                <title>Teacher Management | SLA</title>
            </Head>

            <div className="bg-white border-b border-border px-6 sticky top-0 z-40 shadow-sm h-16 flex items-center">
                <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <LogoContainer />
                        <h1 className="text-xl font-bold tracking-tight text-foreground hidden sm:block uppercase tracking-widest">Admin Faculty</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <Link 
                            href="/dashboard/admin" 
                            className="btn-outline px-4 py-2 text-[10px] font-bold uppercase tracking-widest"
                        >
                            &larr; Hub
                        </Link>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2 text-foreground">Teacher Management</h2>
                    <p className="text-secondary text-sm font-semibold">
                        Add or manage teachers and their assigned classes.
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 mb-6 font-bold text-sm">
                        {error}
                    </div>
                )}

                <div className="flex justify-end mb-8">
                    <button 
                        onClick={handleCreateNew} 
                        className="btn-primary"
                    >
                        + Register New Teacher
                    </button>
                </div>

                <div className="bg-white rounded-[2rem] border border-border overflow-hidden shadow-sm">
                    <AdminLecturerTable 
                        lecturers={lecturers} 
                        onEdit={handleEdit} 
                        onDelete={handleDelete} 
                    />
                </div>
            </main>

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