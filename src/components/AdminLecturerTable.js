import React from 'react';

const AdminLecturerTable = ({ lecturers, onEdit, onDelete }) => {
    
    const headers = [
        { key: 'identity', label: 'Teacher Name' },
        { key: 'comms', label: 'Email' },
        { key: 'jurisdiction', label: 'Assigned Classes' },
        { key: 'commands', label: 'Action', align: 'right' },
    ];

    if (!lecturers || lecturers.length === 0) {
        return (
            <div className="py-20 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
                <p className="text-xl font-bold text-gray-400">No teachers found</p>
                <p className="text-xs text-gray-400 mt-2 tracking-wide uppercase">Register a new teacher to get started</p>
            </div>
        );
    }

    return (
        <div className="bg-white">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 text-[10px] font-bold text-secondary uppercase tracking-widest border-b border-border">
                            {headers.map((header) => (
                                <th 
                                    key={header.key} 
                                    className={`py-5 px-8 ${header.align === 'right' ? 'text-right' : ''}`}
                                >
                                    {header.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {lecturers.map((lecturer) => (
                            <tr key={lecturer.id} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="py-6 px-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg">
                                            {lecturer.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-foreground">
                                                {lecturer.name}
                                            </span>
                                            <span className="text-[10px] font-bold text-secondary uppercase">Teacher</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-6 px-8 text-sm font-semibold text-secondary">
                                    {lecturer.email}
                                </td>
                                
                                <td className="py-6 px-8">
                                    <div className="flex flex-wrap gap-2">
                                        {lecturer.courses && lecturer.courses.length > 0 ? (
                                            lecturer.courses.map(course => (
                                                <span key={course.id} className="bg-white border border-border text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm">
                                                    {course.code}
                                                </span>
                                            )) 
                                        ) : (
                                            <span className="text-[10px] font-bold text-orange-500 uppercase">None assigned</span>
                                        )}
                                    </div>
                                </td>

                                <td className="py-6 px-8 text-right">
                                    <div className="flex gap-2 justify-end">
                                        <button 
                                            onClick={() => onEdit(lecturer)} 
                                            className="p-2 text-gray-400 hover:text-primary transition-colors"
                                            title="Edit Teacher"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        </button>
                                        <button 
                                            onClick={() => onDelete(lecturer.id)} 
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            title="Delete Teacher"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 divide-y divide-gray-50 lg:hidden">
                {lecturers.map((lecturer) => (
                    <div key={lecturer.id} className="p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-xl">
                                    {lecturer.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground">{lecturer.name}</h3>
                                    <p className="text-[10px] font-bold text-secondary uppercase">Teacher</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => onEdit(lecturer)} className="p-2 text-primary">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </button>
                                <button onClick={() => onDelete(lecturer.id)} className="p-2 text-red-500">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </button>
                            </div>
                        </div>
                        <div className="text-sm font-semibold text-secondary ml-16">{lecturer.email}</div>
                        <div className="flex flex-wrap gap-2 ml-16">
                            {lecturer.courses && lecturer.courses.length > 0 ? (
                                lecturer.courses.map(course => (
                                    <span key={course.id} className="bg-gray-100 px-2 py-1 rounded text-[10px] font-bold text-primary">{course.code}</span>
                                ))
                            ) : (
                                <span className="text-[10px] text-orange-500 font-bold uppercase">No classes</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminLecturerTable;