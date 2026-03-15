import React, { useState, useEffect, useCallback } from 'react';

function CourseEnrollmentList({ enrolledCourses, onEnrollSuccess }) {
    const [availableCourses, setAvailableCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrollStatus, setEnrollStatus] = useState({}); 

    const enrolledCourseIds = new Set(enrolledCourses ? enrolledCourses.map(c => c.id) : []);

    const fetchAvailableCourses = useCallback(async () => {
        if (availableCourses.length === 0) {
            setLoading(true);
        }
        setError(null);
        try {
            const response = await fetch('/api/courses/all'); 
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to load available courses.');
            }
            
            const filteredCourses = (data.courses || []).filter(
                course => !enrolledCourseIds.has(course.id)
            );
            
            setAvailableCourses(filteredCourses);
        } catch (err) {
            console.error("Network error fetching available courses:", err);
            setError(err.message || 'Network error: Could not fetch course catalog.');
        } finally {
            setLoading(false);
        }
    }, [enrolledCourseIds]);

    useEffect(() => {
        fetchAvailableCourses();
    }, [fetchAvailableCourses]);

    const handleEnroll = async (courseId, courseTitle) => {
        if (!window.confirm(`Are you sure you want to enroll in "${courseTitle}"?`)) {
            return;
        }

        setEnrollStatus(prev => ({ ...prev, [courseId]: 'loading' }));
        
        try {
            const response = await fetch('/api/student/enrollment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId }),
            });
            
            const data = await response.json();

            if (response.ok) {
                setAvailableCourses(prev => prev.filter(c => c.id !== courseId));
                onEnrollSuccess(); 
            } else {
                alert(`Enrollment Error: ${data.message || 'Failed to enroll.'}`);
                setEnrollStatus(prev => ({ ...prev, [courseId]: 'error' }));
            }
        } catch (err) {
            console.error("Enrollment network error:", err);
            alert('A network error occurred during enrollment.');
            setEnrollStatus(prev => ({ ...prev, [courseId]: 'error' }));
        }
    };


    if (loading) return (
        <div className="flex flex-col items-center justify-center p-32 gap-6 animate-pulse bg-white/5 backdrop-blur-3xl rounded-[40px] border border-white/10">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-indigo-600 uppercase tracking-widest text-[10px] italic">Accessing Course Matrix...</p>
        </div>
    );

    if (error) return (
        <div className="p-10 bg-rose-50 border-2 border-rose-100 rounded-[40px] text-rose-700 flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 my-12">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <p className="font-black text-xl uppercase tracking-tighter text-center italic leading-none">Database Disruption</p>
            <p className="font-bold opacity-70 text-[10px] uppercase tracking-widest">{error}</p>
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in duration-1000">
            <div className="flex flex-col gap-2 px-6">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] italic">Open Enrollment Phase</span>
                </div>
                <h2 className="text-5xl font-black text-gray-900 tracking-tighter leading-none italic uppercase">
                    Available <span className="text-indigo-600">Sectors</span>
                </h2>
            </div>

            {availableCourses.length === 0 ? (
                <div className="py-24 text-center bg-gray-50 border-4 border-dashed border-gray-100 rounded-[40px] animate-in zoom-in-95 mx-6">
                    <p className="text-2xl font-black text-gray-300 italic tracking-tight uppercase">No New Domains Detected</p>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-2">
                        {enrolledCourseIds.size > 0 
                            ? 'All known sectors have been successfully synchronized.'
                            : 'No domains are currently awaiting authorization.'
                        }
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-6 pb-20">
                    {availableCourses.map((course, idx) => (
                        <div 
                            key={course.id} 
                            className="group bg-white rounded-[40px] shadow-2xl shadow-gray-100 border border-gray-50 overflow-hidden flex flex-col transform transition-all hover:-translate-y-2 hover:shadow-indigo-100/50 duration-500"
                            style={{animationDelay: `${idx * 100}ms`}}
                        >
                            <div className="p-8 pb-4">
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100 italic">{course.code}</span>
                                <h4 className="text-2xl font-black text-gray-900 tracking-tight leading-tight mt-4 group-hover:text-indigo-600 transition-colors uppercase italic italic-shadow">
                                    {course.title}
                                </h4>
                            </div>
                            
                            <div className="p-8 pt-0 flex-grow">
                                <p className="text-gray-400 font-bold leading-relaxed text-xs line-clamp-3 mb-8 italic">
                                    {course.description || 'Sector details currently classified or unavailable.'}
                                </p>
                            </div>

                            <div className="p-8 pt-0 mt-auto">
                                <button 
                                    onClick={() => handleEnroll(course.id, course.title)}
                                    disabled={enrollStatus[course.id] === 'loading'}
                                    className={`w-full py-5 font-black rounded-3xl shadow-xl transition-all transform active:scale-95 uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 ${enrollStatus[course.id] === 'loading' ? 'bg-gray-100 text-gray-400' : 'bg-indigo-600 text-white hover:bg-black shadow-indigo-100 hover:shadow-black/20'}`}
                                >
                                    {enrollStatus[course.id] === 'loading' ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Infiltrating...
                                        </>
                                    ) : enrollStatus[course.id] === 'error' ? (
                                        'Relaunch Protocol'
                                    ) : (
                                        <>
                                            Engage Domain
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CourseEnrollmentList;