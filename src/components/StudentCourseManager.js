// components/StudentCourseManager.js

import React, { useState, useEffect } from 'react';
import CourseEnrollmentList from './CourseEnrollmentList';
import CourseCommentThread from './CourseCommentThread'; 
import StudentAssignmentView from './StudentAssignmentView'; 
import StudentResourceView from './StudentResourceView';

/**
 * Manages the student's enrolled course list and the detail view for a selected course.
 * @param {Array} courses - List of courses the student is enrolled in.
 * @param {Function} fetchEnrolledCourses - Function to refresh the main course list.
 * @param {string} studentId - The ID of the currently logged-in student.
 */
function StudentCourseManager({ courses, fetchEnrolledCourses, studentId }) { 
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [view, setView] = useState('my_courses'); // my_courses (list), enrollment_list, course_detail

    // For course_detail view, manage sub-tabs
    const [detailTab, setDetailTab] = useState('assignments'); // assignments, resources, communication

    const handleEnrollmentSuccess = () => {
        setView('my_courses');
        if (fetchEnrolledCourses) {
            fetchEnrolledCourses();
        }
    };

    // --- RENDER COURSE DETAIL VIEW ---
    if (selectedCourse && view === 'course_detail') { 
        // Assuming lecturerId and lecturerName are populated in the selectedCourse object
        const lecturerId = selectedCourse.lecturers?.[0]?.id; // Get the ID of the first lecturer, assuming one for simplicity here
        const lecturerNameDetail = selectedCourse.lecturers?.[0]?.name || 'N/A';

        return (
            <div className="p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-100 mt-4">
                <button 
                    onClick={() => { setSelectedCourse(null); setView('my_courses'); }} 
                    className="mb-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                    &larr; Back to My Courses
                </button>
                <div className="border-b border-gray-200 pb-4 mb-6">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{selectedCourse.code} - {selectedCourse.title}</h3> 
                    <p className="text-lg text-gray-600 font-medium">Lecturer: <span className="text-gray-800">{lecturerNameDetail}</span></p>
                </div>
                
                {/* Tabs for Course Details */}
                <div className="flex border-b-2 border-gray-200 mb-6 overflow-x-auto no-scrollbar">
                    <button 
                        onClick={() => setDetailTab('assignments')} 
                        className={`px-5 py-3 font-medium whitespace-nowrap transition-colors border-b-2 -mb-[2px] ${detailTab === 'assignments' ? 'text-indigo-600 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}
                    >
                        Assignments & Grades 📝
                    </button>
                    <button 
                        onClick={() => setDetailTab('resources')} 
                        className={`px-5 py-3 font-medium whitespace-nowrap transition-colors border-b-2 -mb-[2px] ${detailTab === 'resources' ? 'text-indigo-600 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}
                    >
                        Course Resources 📚
                    </button>
                    <button 
                        onClick={() => setDetailTab('communication')} 
                        className={`px-5 py-3 font-medium whitespace-nowrap transition-colors border-b-2 -mb-[2px] ${detailTab === 'communication' ? 'text-indigo-600 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}
                    >
                        Messages 💬
                    </button>
                </div>

                {/* Content based on detailTab */}
                <div className="bg-gray-50/50 border border-gray-200 p-5 md:p-6 rounded-xl shadow-sm">
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
                        <>
                            <h4 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-3 mb-5">Course Messages</h4>
                            {lecturerId ? ( // Only show communication if a lecturer ID is available
                                <CourseCommentThread 
                                    courseId={selectedCourse.id}
                                    currentUserId={studentId} 
                                    otherUserId={lecturerId} 
                                />
                            ) : (
                                <p className="p-4 bg-blue-50 text-blue-800 border-l-4 border-blue-500 rounded-md bg-opacity-80">No lecturer assigned to this course yet.</p>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    }
    
    // --- RENDER ENROLLMENT LIST VIEW ---
    if (view === 'enrollment_list') {
        return (
            <div className="p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-100 mt-4">
                <button 
                    onClick={() => setView('my_courses')} 
                    className="mb-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                    &larr; Back to My Courses
                </button>
                <CourseEnrollmentList 
                    enrolledCourses={courses}
                    onEnrollSuccess={handleEnrollmentSuccess}
                />
            </div>
        );
    }

    // --- RENDER MY COURSES LIST VIEW (Default) ---
    return (
        <div className="p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-100 mt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-4 mb-6 gap-4">
                <h3 className="text-2xl font-bold text-gray-800">Your Enrolled Courses <span className="text-gray-500 font-medium text-lg ml-2">({courses?.length || 0})</span></h3>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                        onClick={() => setView('enrollment_list')} 
                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg shadow-md transition-colors w-full sm:w-auto text-center"
                    >
                        + Enroll in New Course
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {courses && courses.length > 0 ? (
                    courses.map(course => {
                        // Assuming the course object will have a 'lecturers' array
                        const lecturerNameCard = course.lecturers?.[0]?.name || 'N/A';
                        
                        return (
                            <div 
                                key={course.id} 
                                className="group p-6 border border-gray-200 rounded-xl cursor-pointer bg-white shadow-sm hover:border-indigo-300 hover:shadow-md transition-all duration-200 flex flex-col h-full"
                                onClick={() => { setSelectedCourse(course); setView('course_detail'); }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <h4 className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-2">{course.title}</h4>
                                    <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded border border-gray-200 whitespace-nowrap ml-3">{course.code}</span>
                                </div>
                                <div className="mt-auto pt-4 border-t border-gray-100">
                                    <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                        Lecturer: <span className="font-medium text-gray-700">{lecturerNameCard}</span>
                                    </p>
                                    <button className="w-full py-2.5 bg-indigo-50 group-hover:bg-indigo-600 text-indigo-700 group-hover:text-white font-semibold rounded-lg transition-colors border border-indigo-100 group-hover:border-indigo-600 shadow-sm">
                                        Open Course
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="p-8 bg-blue-50 text-blue-800 border-2 border-dashed border-blue-200 rounded-lg text-center col-span-full mt-2">
                        <svg className="w-12 h-12 text-blue-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        <p className="text-lg font-medium">You are not currently enrolled in any courses.</p>
                        <p className="text-blue-600 mt-2">Click "+ Enroll in New Course" to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StudentCourseManager;