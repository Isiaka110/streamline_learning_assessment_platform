import React, { useState, useEffect } from 'react';
import { withAuthGuard } from '@components/AuthGuard';
import { UserRole } from '@prisma/client';
import AdminCourseTable from '@components/AdminCourseTable';
import CourseFormModal from '@components/CourseFormModal';
import LogoContainer from '@components/LogoContainer';

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
                    setMessage('Course list refreshed successfully.');
                } else {
                    console.error("API response for courses was not an array:", data);
                    setError("Received unexpected data format from the server.");
                    setCourses([]);
                }
            } else {
                setError(data.message || 'Failed to load course data.');
            }
        } catch (err) {
            console.error("Fetch Courses Network Error:", err);
            setError('Network error while fetching courses. Please check your connection.');
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
            const missingIdError = '🚨 Cannot edit: Course ID is missing. Check AdminCourseTable data.';
            setError(missingIdError);
            console.error('Edit failed:', missingIdError, course);
            return;
        }
        
        setCurrentCourse(course); 
        setIsModalOpen(true);
    };
    
    const handleSuccess = (success) => {
        setIsModalOpen(false);
        if (success) {
            fetchCourses();
            setMessage(currentCourse ? 'Course updated successfully!' : 'Course created successfully!');
        }
    };

    const handleDelete = async (courseId) => {
        if (!courseId) {
            setError('Cannot delete: Course ID is missing.');
            return;
        }

        if (typeof window !== 'undefined') {
            const confirmed = prompt(`Type 'DELETE' to confirm you want to delete course ID ${courseId}. This action is permanent.`);
            if (confirmed !== 'DELETE') {
                return;
            }
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
                setMessage('Course successfully deleted.');
            } else {
                const data = await res.json();
                const errorMessage = data.message || `Failed to delete course. Status: ${res.status}`;
                setError(errorMessage);
            }
        } catch (err) {
            console.error("Deletion network error:", err);
            setError('Network error during deletion.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <LogoContainer />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 mt-4">Admin Course Management</h1>
            <p className="text-gray-600 mb-8 border-b border-gray-200 pb-4">Manage all academic courses, including assignment of lecturers and details.</p>

            <div className="flex justify-end mb-6">
                <button 
                    onClick={handleCreateNew} 
                    disabled={isLoading}
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    + Create New Course
                </button>
            </div>
            
            {message && <p className="p-4 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg mb-4">{message}</p>}
            {error && <p className="p-4 bg-red-100 text-red-800 border border-red-300 rounded-lg mb-4">❌ Error: {error}</p>}
            
            <AdminCourseTable 
                courses={courses} 
                isLoading={isLoading} 
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

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