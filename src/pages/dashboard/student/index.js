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

    const userName = session?.user?.name || "Learner"; 
    
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
                setErrorAnnouncements(data.message || 'Institutional communication unavailable.');
            }
        } catch (err) {
            console.error("Network error fetching announcements:", err);
            setErrorAnnouncements('Connectivity error. Re-authenticating...');
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
                setErrorCourses(data.message || 'Failed to retrieve module data.');
                setEnrolledCourses([]);
            }
        } catch (err) {
            console.error("Network error fetching courses:", err);
            setErrorCourses('Module database synchronization failed.');
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
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-accent border-t-transparent animate-spin mx-auto"></div>
                    <p className="text-xs font-black uppercase tracking-widest text-accent italic">Synchronizing Ecosystem...</p>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-background">
            {/* Header Hub */}
            <div className="glass border-b border-foreground/10 px-6 py-6 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="flex items-center gap-4"> 
                        <div className="w-10 h-10 bg-foreground flex items-center justify-center">
                            <span className="text-white font-black italic">SL</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-black italic uppercase tracking-tighter">Academic Hub</h1>
                            <p className="text-[10px] font-bold text-accent uppercase tracking-widest">{userName} | 001-ALPHA</p>
                        </div>
                    </div>
                    
                    <button onClick={handleLogout} className="btn-rect-outline px-4 py-2 text-xs">
                         System Logout
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-12">
                   <h2 className="text-3xl md:text-5xl mb-2">Module Management</h2>
                   <p className="text-secondary font-medium tracking-tight">Active enrollment paths and institutional broadcasts.</p>
                </div>
                
                {/* Tab Navigation */}
                <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                    <button 
                        onClick={() => setActiveTab('announcements')} 
                        className={`btn-rect transition-all ${activeTab === 'announcements' ? 'bg-foreground text-white border-foreground' : 'bg-transparent text-secondary border-transparent hover:border-foreground/20'}`}
                    >
                        Broadcasts
                    </button>
                    <button 
                        onClick={() => setActiveTab('courses')} 
                        className={`btn-rect transition-all ${activeTab === 'courses' ? 'bg-foreground text-white border-foreground' : 'bg-transparent text-secondary border-transparent hover:border-foreground/20'}`}
                    >
                        Active Modules
                    </button>
                </div>
                
                {/* Content Area */}
                <div className="glass p-1 border-2 border-foreground/5 min-h-[500px]">
                    <div className="bg-white/50 p-6 md:p-10 h-full border border-white/40">
                        {activeTab === 'announcements' && (
                            <AnnouncementList 
                                announcements={announcements}
                                isLoading={loadingAnnouncements}
                                error={errorAnnouncements}
                            />
                        )}

                        {activeTab === 'courses' && (
                            <>
                                {(loadingCourses || isSessionLoading) && (
                                    <div className="py-20 text-center">
                                        <div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
                                        <p className="text-xs font-black uppercase tracking-widest text-secondary">Indexing Modules...</p>
                                    </div>
                                )}
                                {errorCourses && (
                                    <div className="p-8 border-2 border-red-500 bg-red-50 text-red-900 mb-8">
                                        <p className="font-black italic uppercase text-sm">Critical Error: {errorCourses}</p>
                                    </div>
                                )}

                                {!loadingCourses && !errorCourses && enrolledCourses && (
                                    <StudentCourseManager 
                                        courses={enrolledCourses} 
                                        fetchEnrolledCourses={fetchEnrolledCourses}
                                        studentId={session?.user?.id}
                                    />
                                )}
                                {!loadingCourses && !errorCourses && enrolledCourses?.length === 0 && (
                                    <div className="py-20 text-center border-2 border-dashed border-foreground/10 group hover:border-accent transition-colors">
                                        <p className="text-2xl font-black italic uppercase mb-4 opacity-20">No Active Modules</p>
                                        <button className="btn-rect-primary">Request Enrollment</button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default withAuthGuard(StudentDashboard, [UserRole.STUDENT]);