import React from 'react';

const AdminCourseTable = ({ courses, onEdit, onDelete }) => {
    return (
        <div className="bg-white">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 text-[10px] font-bold text-secondary uppercase tracking-widest border-b border-border">
                            <th className="py-5 px-8">Class Details</th>
                            <th className="py-5 px-8">Semester & Session</th>
                            <th className="py-5 px-8">Description</th>
                            <th className="py-5 px-8">Teachers</th>
                            <th className="py-5 px-8 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {courses.length > 0 ? (
                            courses.map((course) => (
                                <tr key={course.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="py-6 px-8">
                                        <div className="flex flex-col">
                                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold w-fit mb-1">
                                                {course.code}
                                            </span>
                                            <span className="font-bold text-foreground">
                                                {course.title}
                                            </span>
                                        </div>
                                    </td>
                                    
                                    <td className="py-6 px-8">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-foreground">
                                                {course.semester === 'FIRST' ? '1st Semester' : 
                                                (course.semester === 'SECOND' ? '2nd Semester' : 'Full Year')}
                                            </span>
                                            <span className="text-[10px] font-bold text-secondary uppercase">
                                                {course.year || '2023/2024'}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="py-6 px-8 max-w-xs">
                                        <p className="text-sm text-secondary line-clamp-2 italic">
                                            {course.description || 'No description provided.'}
                                        </p>
                                    </td>
                                    
                                    <td className="py-6 px-8">
                                        <div className="flex -space-x-2">
                                            {course.lecturers && course.lecturers.length > 0 ? (
                                                course.lecturers.map((lecturer) => (
                                                    <div 
                                                        key={lecturer.id} 
                                                        className="h-8 w-8 rounded-full border-2 border-white bg-primary text-[10px] font-bold text-white flex items-center justify-center uppercase"
                                                        title={lecturer.name}
                                                    >
                                                        {lecturer.name.charAt(0)}
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-[10px] font-bold text-orange-500 uppercase">Unassigned</span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="py-6 px-8 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <button 
                                                onClick={() => onEdit(course)} 
                                                className="p-2 text-gray-400 hover:text-primary transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                            </button>
                                            <button 
                                                onClick={() => onDelete(course.id)} 
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="py-20 text-center">
                                    <p className="text-xl font-bold text-gray-400">No classes found</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 divide-y divide-gray-50 lg:hidden">
                {courses.map((course) => (
                    <div key={course.id} className="p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold mb-1 block w-fit">{course.code}</span>
                                <h3 className="font-bold text-foreground text-lg">{course.title}</h3>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => onEdit(course)} className="p-2 text-primary">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </button>
                                <button onClick={() => onDelete(course.id)} className="p-2 text-red-500">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm font-semibold text-secondary">
                            <div>{course.semester === 'FIRST' ? '1st Semester' : '2nd Semester'}</div>
                            <div>{course.year || '2023/2024'}</div>
                        </div>
                        {course.description && (
                            <p className="text-xs text-secondary italic line-clamp-2">{course.description}</p>
                        )}
                        <div className="flex -space-x-2 pt-2">
                             {course.lecturers?.map(l => (
                                 <div key={l.id} className="h-8 w-8 rounded-full border-2 border-white bg-primary text-[10px] font-bold text-white flex items-center justify-center uppercase">{l.name.charAt(0)}</div>
                             ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminCourseTable;