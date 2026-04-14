// components/LecturerCommunication.js
import React, { useState, useEffect, useCallback } from 'react';
import CourseCommentThread from './CourseCommentThread'; 

function LecturerCommunication({ lecturerId, courseId, courseCode }) {
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null); 
    const [error, setError] = useState(null);

    const fetchEnrolledStudents = useCallback(async () => {
        if (!courseId) {
            setLoadingStudents(false);
            return; 
        }

        setLoadingStudents(true);
        setError(null);
        
        const apiUrl = `/api/lecturer/courses/${courseId}/students`;

        try {
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                let errorData = {};
                if (contentType && contentType.includes("application/json")) {
                    errorData = await response.json();
                }
                throw new Error(errorData.message || `Server error: ${response.status}`);
            }

            const data = await response.json();
            const fetchedStudents = data.students || [];

            setStudents(fetchedStudents);
            
            if (fetchedStudents.length > 0 && !selectedStudent) {
                setSelectedStudent(fetchedStudents[0]);
            } else if (fetchedStudents.length === 0) {
                 setSelectedStudent(null);
            }
            
        } catch (err) {
            console.error("Error fetching students:", err);
            setError(`Failed to fetch student list: ${err.message}`);
            setStudents([]);
            setSelectedStudent(null);
        } finally {
            setLoadingStudents(false);
        }
    }, [courseId, selectedStudent]);


    useEffect(() => {
        if (courseId) {
            fetchEnrolledStudents();
        } else {
            setStudents([]);
            setSelectedStudent(null);
            setLoadingStudents(false);
            setError(null);
        }
    }, [courseId, fetchEnrolledStudents]);

    const handleStudentSelect = (e) => {
        const studentId = e.target.value;
        const student = students.find(s => s.id === studentId);
        setSelectedStudent(student);
    };

    if (!courseId) return <div className="p-6 bg-blue-50 text-blue-800 rounded-2xl border border-blue-100 font-semibold mb-6">Select a class to start messaging.</div>;
    
    if (error) return <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-semibold mb-6">{error}</div>;
    
    if (loadingStudents) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4 animate-pulse">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-secondary text-xs">Loading students...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <h3 className="text-3xl font-bold text-foreground tracking-tight">
                Student Messages for {courseCode}
            </h3>

            {students.length === 0 ? (
                <div className="py-20 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                    <p className="text-xl font-bold text-gray-400">No students joined yet</p>
                    <p className="text-xs text-secondary mt-1 tracking-wide">When students join this class, you can message them here.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="p-6 bg-gray-50 rounded-3xl border border-border flex flex-col md:flex-row items-center gap-4">
                        <label htmlFor="student-select" className="font-bold text-foreground text-sm flex-shrink-0">Chat with:</label>
                        <select
                            id="student-select"
                            className="flex-1 w-full p-3 rounded-xl border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-semibold bg-white"
                            value={selectedStudent?.id || ''} 
                            onChange={handleStudentSelect}
                        >
                            {students.map(student => (
                                <option key={student.id} value={student.id}>
                                    {student.name} ({student.email.substring(0, 10)}...)
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedStudent ? ( 
                        <div className="bg-white rounded-[2rem] border border-border overflow-hidden shadow-sm">
                            <div className="bg-gray-50 p-6 border-b border-border flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                                    {selectedStudent.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-foreground">{selectedStudent.name}</h4>
                                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Enrolled Student</p>
                                </div>
                            </div>
                            <div className="p-8">
                                <CourseCommentThread 
                                    courseId={courseId} 
                                    currentUserId={lecturerId} 
                                    otherUserId={selectedStudent.id} 
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-gray-50 rounded-3xl">
                            <p className="font-bold text-secondary">Please select a student from the list.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default LecturerCommunication;