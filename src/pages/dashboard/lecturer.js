import React, { useState, useEffect, useCallback } from 'react';
import { signOut, useSession } from 'next-auth/react'; 
import { withAuthGuard } from '@components/AuthGuard';
import { UserRole } from '@prisma/client'; 
import AssignmentManager from '@components/AssignmentManager';
import ResourceManager from '@components/ResourceManager';
import LogoContainer from '@components/LogoContainer';
import LecturerCommunication from '@components/LecturerCommunication'; 
import AnnouncementList from '@components/AnnouncementList'; 

const mobileBreakpoint = 768;

function LecturerDashboard() {
    const { data: session } = useSession();
    const userName = session?.user?.name || "Lecturer"; 
    const lecturerId = session?.user?.id; 
    
    const [courses, setCourses] = useState(null);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [errorCourses, setErrorCourses] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null); 
    const [activeTab, setActiveTab] = useState('announcements'); 
    const [announcements, setAnnouncements] = useState([]);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
    const [errorAnnouncements, setErrorAnnouncements] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < mobileBreakpoint);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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

    const fetchLecturerCourses = useCallback(async () => {
        setLoadingCourses(true);
        setErrorCourses(null);
        try {
            const response = await fetch('/api/lecturer/courses'); 
            const data = await response.json();
            if (response.ok) {
                setCourses(data.courses);
                if (data.courses && data.courses.length > 0) {
                    setSelectedCourse(data.courses[0]); 
                }
            } else {
                setErrorCourses(data.message || 'Failed to fetch your courses.');
                setCourses([]);
            }
        } catch (err) {
            console.error("Network error fetching courses:", err);
            setErrorCourses('Network error fetching courses.');
            setCourses([]);
        } finally {
            setLoadingCourses(false);
        }
    }, []);

    useEffect(() => {
        fetchLecturerCourses();
        fetchAnnouncements(); 
    }, [fetchLecturerCourses, fetchAnnouncements]);

    const handleLogout = () => {
        signOut({ callbackUrl: '/' }); 
    };
    
    const handleCourseChange = (e) => {
        const courseId = e.target.value;
        const newCourse = courses.find(c => c.id === courseId);
        setSelectedCourse(newCourse);
    };

    const isCourseSelected = !!selectedCourse;

    return (
        <div className="min-h-screen bg-gray-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-200 gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto"> 
                    <div className="flex items-center shrink-0">
                        <LogoContainer /> 
                        <span className="text-xl sm:text-2xl font-black text-indigo-600 ml-2 tracking-wide mt-1">LMS</span> 
                    </div>
                    <div className="h-8 w-[2px] bg-gray-200 mx-1 sm:mx-2 hidden sm:block"></div>
                    <h1 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">Lecturer Dashboard: {userName}</h1>
                </div>
                <button onClick={handleLogout} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow-md transition-colors text-xs sm:text-sm self-end sm:self-auto">
                    Logout 🚪
                </button>
            </div>
            
            <p className="text-gray-600 mb-8 border-b border-gray-200 pb-4 text-sm sm:text-base">Manage assignments, course resources, and student communications.</p>
            
            {/* Course Selector */}
            <div className="mb-6 flex flex-col md:flex-row items-start md:items-center gap-3 sm:gap-4 p-4 bg-gray-100 border border-gray-200 rounded-xl">
                <label htmlFor="course-select" className="font-bold text-gray-700 text-base sm:text-lg">Currently Managing:</label>
                <select
                    id="course-select"
                    className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-80 text-sm sm:text-base"
                    value={selectedCourse?.id || ''}
                    onChange={handleCourseChange}
                    disabled={!courses || courses.length === 0 || loadingCourses}
                >
                    {loadingCourses && <option value="">Loading courses...</option>}
                    {!loadingCourses && courses?.length === 0 && <option value="">No courses assigned.</option>}
                    {!loadingCourses && courses?.length > 0 && courses.map(course => (
                        <option key={course.id} value={course.id}>
                            {course.code} - {course.title}
                        </option>
                    ))}
                </select>
            </div>

            {/* Tab Navigation (Responsive) */}
            <div className="flex overflow-x-auto whitespace-nowrap border-b-2 border-gray-200 mb-6 pb-1 -mx-2 px-2 md:mx-0 md:px-0 scrollbar-hide">
                <button 
                    onClick={() => setActiveTab('announcements')} 
                    className={`px-4 py-3 shrink-0 font-semibold text-sm md:text-lg transition-colors border-b-2 ${activeTab === 'announcements' ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-indigo-500 hover:border-indigo-300'}`}
                >
                    Announcements 📢
                </button>
                <button 
                    onClick={() => setActiveTab('assignments')} 
                    disabled={!isCourseSelected} 
                    className={`px-4 py-3 shrink-0 font-semibold text-sm md:text-lg transition-colors border-b-2 disabled:opacity-50 disabled:cursor-not-allowed ${activeTab === 'assignments' ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-indigo-500 hover:border-indigo-300'}`}
                >
                    Assignment & Grading 📝
                </button>
                <button 
                    onClick={() => setActiveTab('resources')} 
                    disabled={!isCourseSelected}
                    className={`px-4 py-3 shrink-0 font-semibold text-sm md:text-lg transition-colors border-b-2 disabled:opacity-50 disabled:cursor-not-allowed ${activeTab === 'resources' ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-indigo-500 hover:border-indigo-300'}`}
                >
                    Resource Management 📚
                </button>
                <button 
                    onClick={() => setActiveTab('communication')} 
                    disabled={!isCourseSelected}
                    className={`px-4 py-3 shrink-0 font-semibold text-sm md:text-lg transition-colors border-b-2 disabled:opacity-50 disabled:cursor-not-allowed ${activeTab === 'communication' ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-indigo-500 hover:border-indigo-300'}`}
                >
                    Student Communication 💬
                </button>
            </div>
            
            {/* Manager Components */}
            <div className="md:p-4 break-words">
                {activeTab === 'announcements' && (
                    <AnnouncementList 
                        announcements={announcements}
                        isLoading={loadingAnnouncements}
                        error={errorAnnouncements}
                    />
                )}
                
                {isCourseSelected && (
                    <>
                        {activeTab === 'assignments' && (
                            <AssignmentManager courseId={selectedCourse.id} courseCode={selectedCourse.code} />
                        )}
                        {activeTab === 'resources' && (
                            <ResourceManager courseId={selectedCourse.id} courseCode={selectedCourse.code} />
                        )}
                        {activeTab === 'communication' && (
                            <LecturerCommunication 
                                lecturerId={lecturerId} 
                                courseId={selectedCourse.id} 
                                courseCode={selectedCourse.code} 
                            />
                        )}
                    </>
                )}
                
                {!isCourseSelected && activeTab !== 'announcements' && courses?.length > 0 && (
                    <p className="p-6 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-center font-medium">Please select a course from the dropdown above to begin management.</p>
                )}
                {courses?.length === 0 && !loadingCourses && (
                    <p className="p-6 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-center font-medium">You have not been assigned any courses yet. Please contact an administrator.</p>
                )}
            </div>
        </div>
    );
}

export default withAuthGuard(LecturerDashboard, [UserRole.LECTURER]);
