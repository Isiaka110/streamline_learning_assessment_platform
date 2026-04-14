import React, { useState, useEffect, useCallback } from 'react';
import { signOut, useSession } from 'next-auth/react'; 
import { withAuthGuard } from '@components/AuthGuard';
import { UserRole } from '@prisma/client';
import StudentCourseManager from '@components/StudentCourseManager';
import AnnouncementList from '@components/AnnouncementList'; 
import NotificationBell from '@components/NotificationBell';

function StudentDashboard() {
    const { data: session, status } = useSession();
    const isSessionLoading = status === 'loading'; 

    const userName = session?.user?.name || "Student"; 
    const studentId = session?.user?.id;
    
    const [enrolledCourses, setEnrolledCourses] = useState(null);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [stats, setStats] = useState({
        totalClasses: 0,
        pendingAssignments: 0,
        completedAssignments: 0,
        averageGrade: 0
    });
    const [loadingStats, setLoadingStats] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); 
    
    const [announcements, setAnnouncements] = useState([]);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

    const fetchAnnouncements = useCallback(async () => {
        setLoadingAnnouncements(true);
        try {
            const response = await fetch('/api/announcements'); 
            const data = await response.json();
            if (response.ok) setAnnouncements(data.announcements || []);
        } catch (err) { console.error("Announcements error:", err); } 
        finally { setLoadingAnnouncements(false); }
    }, []);

    const fetchEnrolledCourses = useCallback(async () => {
        setLoadingCourses(true);
        try {
            const response = await fetch('/api/student/courses');
            const data = await response.json();
            if (response.ok) setEnrolledCourses(data.courses || []);
        } catch (err) { console.error("Courses error:", err); } 
        finally { setLoadingCourses(false); }
    }, []);

    const fetchStats = useCallback(async () => {
        setLoadingStats(true);
        try {
            const response = await fetch('/api/student/stats');
            const data = await response.json();
            if (response.ok) setStats(data);
        } catch (err) { console.error("Stats error:", err); } 
        finally { setLoadingStats(true); setLoadingStats(false); }
    }, []);

    useEffect(() => {
        if (!isSessionLoading) {
            fetchEnrolledCourses();
            fetchAnnouncements(); 
            fetchStats();
        }
    }, [isSessionLoading, fetchEnrolledCourses, fetchAnnouncements, fetchStats]); 

    const handleLogout = () => {
        signOut({ callbackUrl: '/auth/signin' }); 
    };

    if (isSessionLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm font-bold text-primary">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-white border-b border-border px-6 py-4 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="flex items-center gap-3"> 
                        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                            <span className="text-primary font-bold text-xl">S</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-foreground uppercase tracking-widest">SLA Hub</h1>
                            <p className="text-xs font-semibold text-secondary">Student Access: {userName}</p>
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
                {/* Dashboard Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 border-b border-border">
                    <button 
                        onClick={() => setActiveTab('overview')} 
                        className={`px-5 py-2 rounded-t-xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-primary text-white' : 'text-secondary hover:text-primary'}`}
                    >
                        My Progress
                    </button>
                    <button 
                        onClick={() => setActiveTab('courses')} 
                        className={`px-5 py-2 rounded-t-xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'courses' ? 'bg-primary text-white' : 'text-secondary hover:text-primary'}`}
                    >
                        Classes & Assignments
                    </button>
                    <button 
                        onClick={() => setActiveTab('announcements')} 
                        className={`px-5 py-2 rounded-t-xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'announcements' ? 'bg-primary text-white' : 'text-secondary hover:text-primary'}`}
                    >
                        Platform Notices
                    </button>
                </div>

                {activeTab === 'overview' && (
                    <div className="animate-in fade-in duration-500">
                        {/* Stats Cards Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            <div className="bg-primary text-white rounded-[2rem] p-8 shadow-md relative overflow-hidden">
                                <h3 className="text-sm font-bold opacity-80 mb-2 uppercase tracking-widest">Active Classes</h3>
                                <div className="text-5xl font-bold">{stats.totalClasses}</div>
                                <div className="absolute right-0 bottom-0 w-24 h-24 bg-white/10 rounded-tl-full translate-x-4 translate-y-4"></div>
                            </div>

                            <div className="bg-[#10B981] text-white rounded-[2rem] p-8 shadow-md relative overflow-hidden">
                                <h3 className="text-sm font-bold opacity-80 mb-2 uppercase tracking-widest">Assignments</h3>
                                <div className="text-5xl font-bold">{stats.completedAssignments}</div>
                                <p className="text-xs font-bold opacity-80 mt-2 uppercase tracking-tight">Completed so far</p>
                                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full translate-x-2 -translate-y-2"></div>
                            </div>

                            <div className="bg-[#F59E0B] text-white rounded-[2rem] p-8 shadow-md relative overflow-hidden">
                                <h3 className="text-sm font-bold opacity-80 mb-2 uppercase tracking-widest">Pending</h3>
                                <div className="text-5xl font-bold">{stats.pendingAssignments}</div>
                                <p className="text-xs font-bold opacity-80 mt-2 uppercase tracking-tight">Need your attention</p>
                                <div className="absolute right-0 top-0 w-20 h-20 bg-white/10 rounded-bl-full"></div>
                            </div>

                            <div className="bg-[#8B5CF6] text-white rounded-[2rem] p-8 shadow-md relative overflow-hidden">
                                <h3 className="text-sm font-bold opacity-80 mb-2 uppercase tracking-widest">Mean Grade</h3>
                                <div className="text-5xl font-bold">{stats.averageGrade}%</div>
                                <p className="text-xs font-bold opacity-80 mt-2 uppercase tracking-tight">Overall Performance</p>
                                <div className="absolute left-0 bottom-0 w-20 h-20 bg-white/10 rounded-tr-full -translate-x-2 translate-y-2"></div>
                            </div>
                        </div>

                        {/* Mission Vision Card */}
                        <div className="bg-white rounded-[2.5rem] p-10 border border-border flex flex-col md:flex-row items-center gap-10 shadow-sm">
                           <div className="w-24 h-24 bg-primary/10 text-primary rounded-3xl flex items-center justify-center flex-shrink-0 animate-pulse">
                              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                           </div>
                           <div>
                              <h2 className="text-2xl font-bold text-foreground mb-4">SLA: Institutional Digital Hub</h2>
                              <p className="text-secondary font-semibold italic text-lg leading-relaxed">
                                 "Our mission is to eliminate the inefficiencies of manual recordkeeping and enhance academic transparency through lightweight digital systems."
                              </p>
                           </div>
                        </div>
                    </div>
                )}

                {activeTab === 'courses' && (
                    <div className="animate-in fade-in duration-500">
                        <StudentCourseManager 
                            courses={enrolledCourses} 
                            fetchEnrolledCourses={fetchEnrolledCourses}
                            studentId={studentId} 
                        />
                    </div>
                )}

                {activeTab === 'announcements' && (
                    <div className="bg-white p-10 rounded-[2.5rem] border border-border shadow-sm animate-in fade-in duration-500">
                        <AnnouncementList 
                            announcements={announcements}
                            isLoading={loadingAnnouncements}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}

export default withAuthGuard(StudentDashboard, [UserRole.STUDENT]);