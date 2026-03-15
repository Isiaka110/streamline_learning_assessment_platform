import React from 'react';

const AdminCourseTable = ({ courses, onEdit, onDelete }) => {
    return (
        <div className="space-y-6">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-hidden bg-white/50 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/50 animate-in fade-in duration-700">
                <table className="w-full border-separate border-spacing-0">
                    <thead>
                        <tr className="bg-gray-900/5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">
                            <th className="py-6 px-8 rounded-tl-[40px]">Course Title</th>
                            <th className="py-6 px-8">Semester & Year</th>
                            <th className="py-6 px-8">Description</th>
                            <th className="py-6 px-8">Lecturers</th>
                            <th className="py-6 px-8 text-right rounded-tr-[40px]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/50">
                        {courses.length > 0 ? (
                            courses.map((course, idx) => (
                                <tr key={course.id} className="group hover:bg-white transition-all duration-300">
                                    <td className="py-8 px-8">
                                        <div className="flex flex-col gap-1">
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest w-fit mb-1">
                                                {course.code}
                                            </span>
                                            <span className="text-xl font-black text-gray-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                                                {course.title}
                                            </span>
                                        </div>
                                    </td>
                                    
                                    <td className="py-8 px-8">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-gray-700">
                                                {course.semester === 'FIRST' ? '1st Semester' : 
                                                (course.semester === 'SECOND' ? '2nd Semester' : 'N/A')}
                                            </span>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                                Session {course.year || 'N/A'}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="py-8 px-8 max-w-xs">
                                        <p className="text-sm font-medium text-gray-500 line-clamp-2 leading-relaxed italic" title={course.description}>
                                            {course.description ? `"${course.description}"` : 'No description available.'}
                                        </p>
                                    </td>
                                    
                                    <td className="py-8 px-8">
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {course.lecturers && course.lecturers.length > 0 ? (
                                                course.lecturers.map((lecturer, lIdx) => (
                                                    <div 
                                                        key={lecturer.id} 
                                                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white uppercase shadow-lg transition-transform hover:scale-125 hover:z-10 cursor-help"
                                                        title={lecturer.name}
                                                    >
                                                        {lecturer.name.charAt(0)}
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest animate-pulse">Unassigned</span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="py-8 px-8 text-right">
                                        <div className="flex gap-3 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-x-0 translate-x-4">
                                            <button 
                                                onClick={() => onEdit(course)} 
                                                className="p-3 bg-white border border-gray-100 text-amber-500 hover:bg-amber-500 hover:text-white rounded-2xl shadow-xl shadow-gray-100 hover:shadow-amber-100 transition-all active:scale-90"
                                                title="Edit Course"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                            </button>
                                            <button 
                                                onClick={() => onDelete(course.id)} 
                                                className="p-3 bg-white border border-gray-100 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl shadow-xl shadow-gray-100 hover:shadow-rose-100 transition-all active:scale-90"
                                                title="Delete Course"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="py-24 px-8 text-center bg-gray-50/30 rounded-b-[40px]">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center text-gray-200">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                                        </div>
                                        <p className="text-xl font-black text-gray-300 italic tracking-tight">No courses found.</p>
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Create a new course</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-6 lg:hidden">
                {courses.length > 0 ? (
                    courses.map((course) => (
                        <div key={course.id} className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100 flex flex-col gap-6 animate-in slide-in-from-bottom-5 duration-500">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest w-fit">
                                        {course.code}
                                    </span>
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-[1.1]">{course.title}</h3>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => onEdit(course)} 
                                        className="p-3 bg-gray-50 text-amber-500 rounded-2xl border border-gray-100 active:scale-90"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                    </button>
                                    <button 
                                        onClick={() => onDelete(course.id)} 
                                        className="p-3 bg-gray-50 text-rose-500 rounded-2xl border border-gray-100 active:scale-90"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-3xl space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Semester</p>
                                        <p className="text-sm font-black text-gray-700">
                                            {course.semester === 'FIRST' ? '1st Semester' : 
                                            (course.semester === 'SECOND' ? '2nd Semester' : 'N/A')}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Session</p>
                                        <p className="text-sm font-black text-gray-700">{course.year || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Description</p>
                                    <p className="text-sm font-medium text-gray-600 line-clamp-3 leading-relaxed italic">
                                        {course.description ? `"${course.description}"` : 'No description available.'}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Lecturers</p>
                                    <div className="flex -space-x-2 overflow-hidden">
                                        {course.lecturers && course.lecturers.length > 0 ? (
                                            course.lecturers.map((lecturer) => (
                                                <div 
                                                    key={lecturer.id} 
                                                    className="inline-block h-10 w-10 rounded-2xl ring-4 ring-white bg-indigo-600 flex items-center justify-center text-xs font-black text-white uppercase shadow-lg"
                                                    title={lecturer.name}
                                                >
                                                    {lecturer.name.charAt(0)}
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest italic pl-1">Unassigned</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-24 px-8 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                         <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                            </div>
                            <p className="text-xl font-black text-gray-300 italic tracking-tight">No courses found.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCourseTable;