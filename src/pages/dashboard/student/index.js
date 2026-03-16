import React, { useState, useEffect, useCallback } from 'react';
import { signOut, useSession } from 'next-auth/react'; 
import { withAuthGuard } from '@components/AuthGuard';
import { UserRole } from '@prisma/client';
import LogoContainer from '@components/LogoContainer'; 
import StudentCourseManager from '@components/StudentCourseManager';
import AnnouncementList from '@components/AnnouncementList'; 

function StudentDashboard() {
    const { data: session, status } = useSession();
    const isSessionLoading = status === 'loading'; 

    const userName = session?.user?.name || "Student"; 
    
    const [enrolledCourses, setEnrolledCourses] = useState(null);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [errorCourses, setErrorCourses] = useState(null);
    const [activeTab, setActiveTab] = useState('announcements'); 
    
    const [announcements, setAnnouncements] = useState([]);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
    const [errorAnnouncements, setErrorAnnouncements] = useState(null);

    const fetchAnnouncements = useCallback(async () => {
        setLoadingAnnouncements(true);
        setErrorAnnouncements(null);
        try {
            const response = await fetch('/api/announcements'); 
            const data = await response.json();
            
            if (response.ok) {
                setAnnouncements(data.announcements || []);
            } else {
                setErrorAnnouncements(data.message || 'Failed to load announcements.');
            }
        } catch (err) {
            console.error("Network error fetching announcements:", err);
            setErrorAnnouncements('Network error fetching announcements.');
        } finally {
            setLoadingAnnouncements(false);
        }
    }, []);

    const fetchEnrolledCourses = useCallback(async () => {
        setLoadingCourses(true);
        setErrorCourses(null);
        try {
            const response = await fetch('/api/student/courses');
            const data = await response.json();

            if (response.ok) {
                setEnrolledCourses(data.courses || []);
            } else {
                setErrorCourses(data.message || 'Failed to fetch enrolled courses.');
                setEnrolledCourses([]);
            }
        } catch (err) {
            console.error("Network error fetching courses:", err);
            setErrorCourses('Network error fetching courses. Check API server status.');
            setEnrolledCourses([]);
        } finally {
            setLoadingCourses(false);
        }
    }, []);

    useEffect(() => {
        if (!isSessionLoading) {
            fetchEnrolledCourses();
            fetchAnnouncements(); 
        }
    }, [isSessionLoading, fetchEnrolledCourses, fetchAnnouncements]); 

    const handleLogout = () => {
        signOut({ callbackUrl: '/auth/signin' }); 
    };

    if (isSessionLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-xl font-semibold text-blue-600 animate-pulse">Initializing session and loading dashboard...</p></div>;
    }


    return (
        <div className="min-h-screen bg-gray-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-200 gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto"> 
                    <div className="flex items-center shrink-0">
                        <LogoContainer /> 
                        <span className="text-xl sm:text-2xl font-black text-indigo-600 ml-2 tracking-wide mt-1">LMS</span> 
                    </div>
                    <div className="h-8 w-[2px] bg-gray-200 mx-1 sm:mx-2 hidden sm:block"></div>
                    <h1 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">Learning Hub: {userName}</h1>
                </div>
                
                <button onClick={handleLogout} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow-md transition-colors text-xs sm:text-sm self-end sm:self-auto">
                    Logout 🚪
                </button>
            </div>
            
            <p className="text-gray-600 mb-8 border-b border-gray-200 pb-4">Centralizing your courses, assessments, and communications.</p>
            
            {/* Tab Navigation (Responsive) */}
            <div className="flex overflow-x-auto whitespace-nowrap border-b-2 border-gray-200 mb-6 pb-1 -mx-2 px-2 md:mx-0 md:px-0 scrollbar-hide">
                <button 
                    onClick={() => setActiveTab('announcements')} 
                    className={`px-4 py-3 shrink-0 font-semibold text-sm md:text-lg transition-colors border-b-2 ${activeTab === 'announcements' ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-indigo-500 hover:border-indigo-300'}`}
                >
                    Announcements 📢
                </button>
                <button 
                    onClick={() => setActiveTab('courses')} 
                    className={`px-4 py-3 shrink-0 font-semibold text-sm md:text-lg transition-colors border-b-2 ${activeTab === 'courses' ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-indigo-500 hover:border-indigo-300'}`}
                >
                    My Courses 📚
                </button>
            </div>
            
            {/* Tab Content Area */}
            <div className="md:p-4 bg-white md:rounded-xl md:shadow-sm min-h-[400px] break-words">
                {/* Render Announcements */}
                {activeTab === 'announcements' && (
                    <AnnouncementList 
                        announcements={announcements}
                        isLoading={loadingAnnouncements}
                        error={errorAnnouncements}
                    />
                )}

                {activeTab === 'courses' && (
                    <>
                        {(loadingCourses || isSessionLoading) && <p className="text-center py-8 text-lg text-blue-500 animate-pulse">Loading your course data...</p>}
                        {errorCourses && <p className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg mb-5">Error: {errorCourses}</p>}

                        {!loadingCourses && !errorCourses && enrolledCourses && (
                            <StudentCourseManager 
                                courses={enrolledCourses} 
                                fetchEnrolledCourses={fetchEnrolledCourses}
                                studentId={session?.user?.id}
                            />
                        )}
                        {!loadingCourses && !errorCourses && enrolledCourses?.length === 0 && (
                            <div className="p-6 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-center">
                                <p className="font-semibold text-lg mb-2">You are not currently enrolled in any courses.</p>
                                <p>Check available courses or contact an administrator.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default withAuthGuard(StudentDashboard, [UserRole.STUDENT]);