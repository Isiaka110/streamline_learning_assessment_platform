// components/StudentCourseManager.js

import React, { useState, useEffect } from 'react';
import CourseEnrollmentList from './CourseEnrollmentList';
import CourseCommentThread from './CourseCommentThread'; 
import StudentAssignmentView from './StudentAssignmentView'; 
import StudentResourceView from './StudentResourceView';

function StudentCourseManager({ courses, fetchEnrolledCourses, studentId }) { 
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [view, setView] = useState('my_courses'); 
    const [detailTab, setDetailTab] = useState('assignments'); 

    const handleEnrollmentSuccess = () => {
        setView('my_courses');
        if (fetchEnrolledCourses) {
            fetchEnrolledCourses();
        }
    };

    // --- RENDER COURSE DETAIL VIEW ---
    if (selectedCourse && view === 'course_detail') { 
        const lecturerId = selectedCourse.lecturers?.[0]?.id; 
        const lecturerNameDetail = selectedCourse.lecturers?.[0]?.name || 'Unassigned';

        return (
            <div className="bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden mt-6 animate-in fade-in duration-500">
                <div className="bg-primary p-10 text-white relative">
                    {/* Background accent */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-20 -translate-y-20 blur-3xl"></div>
                    
                    <button 
                        onClick={() => { setSelectedCourse(null); setView('my_courses'); }} 
                        className="relative z-10 mb-8 px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl transition-all flex items-center gap-2 text-[10px] uppercase tracking-widest"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"/></svg>
                        Back to My Classes
                    </button>
                    <div className="relative z-10">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-2 block">{selectedCourse.code}</span>
                        <h3 className="text-4xl font-bold mb-2 tracking-tight">{selectedCourse.title}</h3> 
                        <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Teacher: {lecturerNameDetail}</p>
                    </div>
                </div>
                
                <div className="p-10">
                    {/* Consolidated Tabs UI */}
                    <div className="flex gap-2 border-b border-border mb-10 overflow-x-auto pb-2">
                        <button 
                            onClick={() => setDetailTab('assignments')} 
                            className={`px-6 py-2.5 font-bold text-xs uppercase tracking-widest rounded-t-xl transition-all ${detailTab === 'assignments' ? 'bg-primary text-white' : 'text-secondary hover:text-primary'}`}
                        >
                            Assignments
                        </button>
                        <button 
                            onClick={() => setDetailTab('resources')} 
                            className={`px-6 py-2.5 font-bold text-xs uppercase tracking-widest rounded-t-xl transition-all ${detailTab === 'resources' ? 'bg-primary text-white' : 'text-secondary hover:text-primary'}`}
                        >
                            Class Files
                        </button>
                        <button 
                            onClick={() => setDetailTab('communication')} 
                            className={`px-6 py-2.5 font-bold text-xs uppercase tracking-widest rounded-t-xl transition-all ${detailTab === 'communication' ? 'bg-primary text-white' : 'text-secondary hover:text-primary'}`}
                        >
                            Teacher Chat
                        </button>
                    </div>

                    <div className="min-h-[400px]">
                        {detailTab === 'assignments' && (
                            <StudentAssignmentView 
                                courseId={selectedCourse.id}
                                studentId={studentId}
                            />
                        )}
                        {detailTab === 'resources' && (
                            <StudentResourceView
                                courseId={selectedCourse.id}
                            />
                        )}
                        {detailTab === 'communication' && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4">
                                <h4 className="text-2xl font-bold text-foreground tracking-tight">Direct Messaging</h4>
                                {lecturerId ? ( 
                                    <CourseCommentThread 
                                        courseId={selectedCourse.id}
                                        currentUserId={studentId} 
                                        otherUserId={lecturerId} 
                                    />
                                ) : (
                                    <div className="p-10 bg-gray-50 text-secondary rounded-[2rem] border border-border text-center">
                                        <p className="font-bold">Chat Unavailable</p>
                                        <p className="text-xs opacity-60 mt-1">No teacher has been assigned to this class yet.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
    
    // --- RENDER ENROLLMENT LIST VIEW ---
    if (view === 'enrollment_list') {
        return (
            <div className="mt-6 animate-in fade-in duration-500">
                <div className="bg-white rounded-[2.5rem] border border-border shadow-sm p-10">
                    <button 
                        onClick={() => setView('my_courses')} 
                        className="mb-10 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-secondary font-bold rounded-xl transition-colors flex items-center gap-2 text-[10px] uppercase tracking-widest border border-border"
                    >
                        &larr; Return to Dashboard
                    </button>
                    <CourseEnrollmentList 
                        enrolledCourses={courses}
                        onEnrollSuccess={handleEnrollmentSuccess}
                    />
                </div>
            </div>
        );
    }

    // --- RENDER MY COURSES LIST VIEW (Default) ---
    return (
        <div className="mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
                <div>
                   <h3 className="text-3xl font-bold text-foreground tracking-tight">My Active Classes</h3>
                   <p className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mt-1 opacity-60">You are enrolled in {courses?.length || 0} classes</p>
                </div>
                <button 
                    onClick={() => setView('enrollment_list')} 
                    className="btn-primary"
                >
                    + Join New Class
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {courses && courses.length > 0 ? (
                    courses.map(course => {
                        const lecturerNameCard = course.lecturers?.[0]?.name || 'Teacher unassigned';
                        
                        return (
                            <div 
                                key={course.id} 
                                className="group p-10 bg-white border border-border rounded-[2.5rem] cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col h-full relative overflow-hidden"
                                onClick={() => { setSelectedCourse(course); setView('course_detail'); }}
                            >
                                {/* Decorative line */}
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-50 group-hover:bg-primary transition-colors"></div>
                                
                                <div className="space-y-4 mb-10">
                                     <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">{course.code}</span>
                                     <h4 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2">{course.title}</h4>
                                </div>
                                <div className="mt-auto pt-8 border-t border-gray-50 flex flex-col gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-sm font-bold text-primary group-hover:bg-primary/10 transition-colors">
                                            {lecturerNameCard.charAt(0)}
                                        </div>
                                        <div className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                                            Teacher: <span className="text-foreground">{lecturerNameCard}</span>
                                        </div>
                                    </div>
                                    <button className="w-full py-4 bg-gray-50 group-hover:bg-primary text-secondary group-hover:text-white font-bold rounded-2xl transition-all text-xs uppercase tracking-widest">
                                        Open Syllabus
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-32 text-center bg-white border-2 border-dashed border-gray-100 rounded-[3rem] col-span-full">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                             <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-black mb-2 tracking-tight">Your bookshelf is empty.</h3>
                        <p className="text-sm font-semibold text-secondary mb-10 opacity-70">Ready to join your first academic class?</p>
                        <button onClick={() => setView('enrollment_list')} className="btn-primary px-10">Start Enrollment</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StudentCourseManager;