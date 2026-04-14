import React, { useState, useEffect, useCallback } from 'react';
import { signOut, useSession } from 'next-auth/react'; 
import { withAuthGuard } from '@components/AuthGuard';
import { UserRole } from '@prisma/client'; 
import AssignmentManager from '@components/AssignmentManager';
import ResourceManager from '@components/ResourceManager';
import LecturerCommunication from '@components/LecturerCommunication'; 
import AnnouncementList from '@components/AnnouncementList'; 
import NotificationBell from '@components/NotificationBell';

function LecturerDashboard() {
    const { data: session } = useSession();
    const userName = session?.user?.name || "Teacher"; 
    const lecturerId = session?.user?.id; 
    
    const [courses, setCourses] = useState(null);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [stats, setStats] = useState({
        totalClasses: 0,
        pendingReviews: 0,
        totalStudents: 0
    });
    const [loadingStats, setLoadingStats] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null); 
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
            if (response.ok) setAnnouncements(data.announcements || []);
        } catch (err) { console.error("Announcements error:", err); } 
        finally { setLoadingAnnouncements(false); }
    }, []);

    const fetchLecturerCourses = useCallback(async () => {
        setLoadingCourses(true);
        try {
            const response = await fetch('/api/lecturer/courses'); 
            const data = await response.json();
            if (response.ok) {
                setCourses(data.courses);
                if (data.courses && data.courses.length > 0) setSelectedCourse(data.courses[0]); 
            }
        } catch (err) { console.error("Courses error:", err); } 
        finally { setLoadingCourses(false); }
    }, []);

    const fetchStats = useCallback(async () => {
        setLoadingStats(true);
        try {
            const response = await fetch('/api/lecturer/stats');
            const data = await response.json();
            if (response.ok) setStats(data);
        } catch (err) { console.error("Stats error:", err); } 
        finally { setLoadingStats(false); }
    }, []);

    useEffect(() => {
        if (lecturerId) {
            fetchLecturerCourses();
            fetchAnnouncements(); 
            fetchStats();
        }
    }, [lecturerId, fetchLecturerCourses, fetchAnnouncements, fetchStats]);

    const handleLogout = () => {
        signOut({ callbackUrl: '/auth/signin' }); 
    };
    
    const handleCourseChange = (e) => {
        const courseId = e.target.value;
        const newCourse = courses.find(c => c.id === courseId);
        setSelectedCourse(newCourse);
    };

    const isCourseSelected = !!selectedCourse;

    const tabs = [
        { id: 'announcements', label: 'Platform Messages', alwaysActive: true },
        { id: 'assignments', label: 'Assignments', alwaysActive: false },
        { id: 'resources', label: 'Class Files', alwaysActive: false },
        { id: 'communication', label: 'Student Chat', alwaysActive: false },
    ];

    return (
        <div className="min-h-screen bg-background pb-20">

            {/* Header */}
            <div className="bg-white border-b border-border px-6 py-4 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="flex items-center gap-3"> 
                        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-bold text-xl">S</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-foreground uppercase tracking-widest">SLA Teacher</h1>
                            <p className="text-xs font-semibold text-secondary">Logged in as {userName}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                        <NotificationBell />
                        <button onClick={handleLogout} className="btn-outline px-4 py-2.5 text-xs">
                             Log Out
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                   <div className="bg-primary text-white rounded-[2rem] p-8 shadow-md relative overflow-hidden">
                      <h3 className="text-sm font-bold opacity-80 mb-2 uppercase tracking-widest">My Classes</h3>
                      <div className="text-5xl font-bold">{stats.totalClasses}</div>
                      <div className="absolute right-0 bottom-0 w-24 h-24 bg-white/10 rounded-tl-full translate-x-4 translate-y-4"></div>
                   </div>
                   <div className="bg-[#8B5CF6] text-white rounded-[2rem] p-8 shadow-md relative overflow-hidden">
                      <h3 className="text-sm font-bold opacity-80 mb-2 uppercase tracking-widest">Pending Review</h3>
                      <div className="text-5xl font-bold">{stats.pendingReviews}</div>
                      <p className="text-xs font-bold opacity-80 mt-2 uppercase tracking-tight">Ungraded submissions</p>
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full translate-x-2 -translate-y-2"></div>
                   </div>
                   <div className="bg-[#F97316] text-white rounded-[2rem] p-8 shadow-md relative overflow-hidden">
                      <h3 className="text-sm font-bold opacity-80 mb-2 uppercase tracking-widest">Enrolled Students</h3>
                      <div className="text-5xl font-bold">{stats.totalStudents}</div>
                      <p className="text-xs font-bold opacity-80 mt-2 uppercase tracking-tight">Across all assigned classes</p>
                      <div className="absolute right-0 top-0 w-20 h-20 bg-white/10 rounded-bl-full"></div>
                   </div>
                </div>

                {/* Class Selector  */}
                <div className="bg-white rounded-[2rem] border border-border p-8 mb-8 shadow-sm">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <label htmlFor="course-select" className="font-bold text-sm text-foreground flex-shrink-0">
                            Active Class Management:
                        </label>
                        <select
                            id="course-select"
                            className="flex-1 w-full p-4 rounded-xl border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-bold bg-gray-50 text-foreground"
                            value={selectedCourse?.id || ''}
                            onChange={handleCourseChange}
                            disabled={!courses || courses.length === 0 || loadingCourses}
                        >
                            {loadingCourses && <option value="">Loading classes...</option>}
                            {!loadingCourses && courses?.length === 0 && <option value="">No classes found.</option>}
                            {!loadingCourses && courses?.length > 0 && courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.code} - {course.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 border-b border-border">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            disabled={!tab.alwaysActive && !isCourseSelected}
                            className={`px-6 py-2.5 rounded-t-xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap 
                                ${activeTab === tab.id ? 'bg-primary text-white' : 'bg-transparent text-secondary hover:text-primary'}
                                disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="min-h-[500px] animate-in fade-in duration-500">
                    {activeTab === 'announcements' && (
                        <div className="bg-white p-10 rounded-[2.5rem] border border-border shadow-sm">
                            <AnnouncementList 
                                announcements={announcements}
                                isLoading={loadingAnnouncements}
                                error={errorAnnouncements}
                            />
                        </div>
                    )}

                    {isCourseSelected && (
                        <div className="space-y-8">
                            {activeTab === 'assignments' && (
                                <AssignmentManager courseId={selectedCourse.id} courseCode={selectedCourse.code} />
                            )}
                            {activeTab === 'resources' && (
                                <ResourceManager courseId={selectedCourse.id} courseCode={selectedCourse.code} />
                            )}
                            {activeTab === 'communication' && (
                                <div className="bg-white p-10 rounded-[2.5rem] border border-border shadow-sm">
                                    <LecturerCommunication 
                                        lecturerId={lecturerId} 
                                        courseId={selectedCourse.id} 
                                        courseCode={selectedCourse.code} 
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {!isCourseSelected && activeTab !== 'announcements' && courses?.length > 0 && (
                        <div className="py-32 text-center bg-white rounded-[2.5rem] border border-border shadow-sm">
                            <h3 className="text-xl font-bold text-black mb-2 tracking-tight">Platform Focus Required</h3>
                            <p className="text-sm font-semibold text-secondary opacity-70">Please select a class from the list above to begin management.</p>
                        </div>
                    )}
                    
                    {courses?.length === 0 && !loadingCourses && (
                        <div className="py-32 text-center bg-white rounded-[2.5rem] border border-border shadow-sm">
                           <h3 className="text-xl font-bold text-black mb-2 tracking-tight">Access Restricted</h3>
                           <p className="text-sm font-semibold text-secondary opacity-70">You are not currently assigned to any active classes.</p>
                        </div>
                    )}
                </div>

                 {/* Platform Mission Card */}
                <div className="mt-12 bg-gray-50 rounded-[2.5rem] p-12 border border-border shadow-sm flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-shrink-0 w-24 h-24 bg-primary/10 text-primary rounded-3xl flex items-center justify-center animate-pulse">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-3xl font-bold text-foreground mb-4 tracking-tight">Institutional Excellence</h3>
                        <p className="text-lg text-secondary leading-relaxed font-semibold italic opacity-80">
                            "Streamlined Learning and Assessment (SLA) is dedicated to the digital leap. We provide the hub for feedback delivery, academic recordkeeping, and resource management without the friction of manual legacy systems."
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default withAuthGuard(LecturerDashboard, [UserRole.LECTURER]);
