import React, { useState, useEffect } from 'react';

export default function EnrolledCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch('/api/student/courses');
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'Failed to load courses.');
                }
                const data = await res.json();
                setCourses(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) return <div className="p-4 text-center text-blue-600 animate-pulse font-medium">Loading courses...</div>;
    if (error) return <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded max-w-2xl mx-auto my-4 text-center font-medium">Error: {error}</div>;
    if (courses.length === 0) return <div className="p-8 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-center mt-4"><p className="text-lg">You are not currently enrolled in any courses.</p></div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {courses.map(course => (
                <div key={course.id} className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">{course.title} <span className="text-sm font-semibold text-gray-500 ml-1">({course.code})</span></h3>
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            Taught by: <span className="text-gray-700 font-medium">{course.lecturerName}</span>
                        </p>
                    </div>
                    
                    <div className="mt-auto">
                        {/* Progress Bar */}
                        <div className="h-2 w-full bg-gray-100 rounded-full mb-2 overflow-hidden shadow-inner">
                            <div className="h-full bg-blue-500 rounded-full transition-all duration-700 ease-out" style={{ width: `${course.progress}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-600 mb-5 font-medium flex justify-between">
                            <span>Progress: <span className="text-gray-800 font-bold">{course.progress}%</span></span>
                            <span>({course.completedSubmissions}/{course.totalAssignments} tasks)</span>
                        </p>

                        <button className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white font-semibold border border-emerald-200 hover:border-emerald-500 rounded-lg transition-colors shadow-sm">Go to Course</button>
                    </div>
                </div>
            ))}
        </div>
    );
}