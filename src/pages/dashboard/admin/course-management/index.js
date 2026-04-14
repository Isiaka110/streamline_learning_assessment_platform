import React, { useState, useEffect } from 'react';
import { withAuthGuard } from '@components/AuthGuard';
import { UserRole } from '@prisma/client';
import AdminCourseTable from '@components/AdminCourseTable';
import CourseFormModal from '@components/CourseFormModal';
import LogoContainer from '@components/LogoContainer';
import NotificationBell from '@components/NotificationBell';
import Link from 'next/link';
import Head from 'next/head';

function AdminCourseManagement() {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCourse, setCurrentCourse] = useState(null); 
    const [message, setMessage] = useState(''); 

    const fetchCourses = async () => {
        setIsLoading(true);
        setError(null);
        setMessage('');
        try {
            const res = await fetch('/api/admin/courses'); 
            const data = await res.json();

            if (res.ok) {
                if (Array.isArray(data)) {
                    setCourses(data);
                } else {
                    setError("Received unexpected data format from the server.");
                    setCourses([]);
                }
            } else {
                setError(data.message || 'Failed to load class data.');
            }
        } catch (err) {
            console.error("Fetch Courses Network Error:", err);
            setError('Could not connect. Please check your internet.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleCreateNew = () => {
        setCurrentCourse(null); 
        setIsModalOpen(true);
        setMessage('');
        setError(null);
    };

    const handleEdit = (course) => {
        setMessage('');
        setError(null);
        
        if (!course || !course.id) {
            setError('Cannot edit: Class ID is missing.');
            return;
        }
        
        setCurrentCourse(course); 
        setIsModalOpen(true);
    };
    
    const handleSuccess = (success) => {
        setIsModalOpen(false);
        if (success) {
            fetchCourses();
            setMessage(currentCourse ? 'Class updated successfully!' : 'Class created successfully!');
        }
    };

    const handleDelete = async (courseId) => {
        if (!courseId) {
            setError('Cannot delete: Class ID is missing.');
            return;
        }

        if (!window.confirm("Are you sure you want to delete this class? This cannot be undone.")) {
            return;
        }
        
        setError(null);
        setMessage('');
        
        try {
            const res = await fetch(`/api/admin/courses/${courseId}`, { 
                method: 'DELETE' 
            });
            
            if (res.ok) {
                setCourses(prevCourses => 
                    prevCourses.filter(c => c.id !== courseId)
                );
                setMessage('Class successfully deleted.');
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to delete class.');
            }
        } catch (err) {
            setError('Network error during deletion.');
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <Head>
                <title>Class Management | SLA</title>
            </Head>

            <div className="bg-white border-b border-border px-6 sticky top-0 z-40 shadow-sm h-16 flex items-center">
                <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <LogoContainer />
                        <h1 className="text-xl font-bold tracking-tight text-foreground hidden sm:block uppercase tracking-widest">Admin Curriculum</h1>
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
                    <h2 className="text-3xl font-bold mb-2 text-foreground tracking-tight">Curriculum Registry</h2>
                    <p className="text-secondary text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                        Create, edit, or delete institutional classes.
                    </p>
                </div>

                {message && (
                    <div className="p-4 bg-green-50 text-green-600 rounded-2xl border border-green-100 mb-6 font-bold text-xs uppercase tracking-widest italic">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 mb-6 font-bold text-xs uppercase tracking-widest italic">
                        {error}
                    </div>
                )}

                <div className="flex justify-end mb-8">
                    <button 
                        onClick={handleCreateNew} 
                        disabled={isLoading}
                        className="btn-primary text-xs uppercase tracking-widest py-3 px-6 shadow-none"
                    >
                        + Register Class
                    </button>
                </div>
                
                <div className="bg-white rounded-[2rem] border border-border overflow-hidden shadow-sm">
                    <AdminCourseTable 
                        courses={courses} 
                        isLoading={isLoading} 
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>
            </main>

            {isModalOpen && (
                <CourseFormModal 
                    course={currentCourse}
                    onSuccess={handleSuccess} 
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}

export default withAuthGuard(AdminCourseManagement, [UserRole.ADMIN]);