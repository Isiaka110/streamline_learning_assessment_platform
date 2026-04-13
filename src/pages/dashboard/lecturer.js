import React, { useState, useEffect, useCallback } from 'react';
import { signOut, useSession } from 'next-auth/react'; 
import { withAuthGuard } from '@components/AuthGuard';
import { UserRole } from '@prisma/client'; 
import AssignmentManager from '@components/AssignmentManager';
import ResourceManager from '@components/ResourceManager';
import LogoContainer from '@components/LogoContainer';
import LecturerCommunication from '@components/LecturerCommunication'; 
import AnnouncementList from '@components/AnnouncementList'; 

function LecturerDashboard() {
    const { data: session } = useSession();
    const userName = session?.user?.name || "Instructor"; 
    const lecturerId = session?.user?.id; 
    
    const [courses, setCourses] = useState(null);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [errorCourses, setErrorCourses] = useState(null);
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
            if (response.ok) {
                setAnnouncements(data.announcements || []);
            } else {
                setErrorAnnouncements(data.message || 'Broadcast feed unavailable.');
            }
        } catch (err) {
            console.error("Network error fetching announcements:", err);
            setErrorAnnouncements('Broadcast network error. Check connectivity.');
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
                setErrorCourses(data.message || 'Module roster fetch failed.');
                setCourses([]);
            }
        } catch (err) {
            console.error("Network error fetching courses:", err);
            setErrorCourses('Module registry synchronization error.');
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
        signOut({ callbackUrl: '/auth/signin' }); 
    };
    
    const handleCourseChange = (e) => {
        const courseId = e.target.value;
        const newCourse = courses.find(c => c.id === courseId);
        setSelectedCourse(newCourse);
    };

    const isCourseSelected = !!selectedCourse;

    const tabs = [
        { id: 'announcements', label: 'Broadcasts', alwaysActive: true },
        { id: 'assignments', label: 'Assessments', alwaysActive: false },
        { id: 'resources', label: 'Resource Vault', alwaysActive: false },
        { id: 'communication', label: 'Learner Comms', alwaysActive: false },
    ];

    return (
        <div className="min-h-screen bg-background">

            {/* Header */}
            <div className="glass border-b border-foreground/10 px-6 py-6 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4"> 
                        <div className="w-10 h-10 bg-foreground flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-black italic text-sm">SL</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none">Instructor Console</h1>
                            <p className="text-[10px] font-bold text-accent uppercase tracking-widest mt-0.5">{userName} | FACULTY</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn-rect-outline px-4 py-2 text-xs">
                        System Logout
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-10">
                    <h2 className="text-3xl md:text-5xl mb-2">Module Operations</h2>
                    <p className="text-secondary font-medium">Manage assessments, resource distribution, and learner communications.</p>
                </div>

                {/* Module Selector */}
                <div className="mb-8 p-6 glass border-2 border-foreground/5">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <label htmlFor="course-select" className="font-black text-[10px] uppercase tracking-widest whitespace-nowrap">
                            Active Module Context:
                        </label>
                        <select
                            id="course-select"
                            className="flex-1 w-full md:w-auto p-3 border-2 border-foreground/20 bg-transparent font-bold text-sm focus:outline-none focus:border-accent transition-colors uppercase tracking-wider"
                            value={selectedCourse?.id || ''}
                            onChange={handleCourseChange}
                            disabled={!courses || courses.length === 0 || loadingCourses}
                        >
                            {loadingCourses && <option value="">Indexing modules...</option>}
                            {!loadingCourses && courses?.length === 0 && <option value="">No modules assigned.</option>}
                            {!loadingCourses && courses?.length > 0 && courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    [{course.code}] {course.title}
                                </option>
                            ))}
                        </select>

                        {selectedCourse && (
                            <div className="hidden md:flex items-center gap-2 px-4 py-3 bg-accent/10 border-l-4 border-accent">
                                <span className="text-[10px] font-black uppercase tracking-widest text-accent">Module Active</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 flex-wrap">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            disabled={!tab.alwaysActive && !isCourseSelected}
                            className={`btn-rect transition-all text-xs disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap 
                                ${activeTab === tab.id ? 'bg-foreground text-white border-foreground' : 'bg-transparent text-secondary border-foreground/20 hover:border-foreground/60'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Panel */}
                <div className="glass border-2 border-foreground/5 p-1 min-h-[500px]">
                    <div className="bg-white/50 p-6 md:p-10 h-full border border-white/40">

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
                            <div className="py-20 text-center border-2 border-dashed border-foreground/10">
                                <p className="text-2xl font-black italic uppercase opacity-20 mb-4">No Module Selected</p>
                                <p className="text-secondary text-sm font-medium">Select a module context above to begin management.</p>
                            </div>
                        )}
                        {courses?.length === 0 && !loadingCourses && (
                            <div className="py-20 text-center border-2 border-dashed border-foreground/10">
                                <p className="text-2xl font-black italic uppercase opacity-20 mb-4">No Modules Assigned</p>
                                <p className="text-secondary text-sm font-medium">Contact the System Administrator to be assigned to a module.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default withAuthGuard(LecturerDashboard, [UserRole.LECTURER]);
