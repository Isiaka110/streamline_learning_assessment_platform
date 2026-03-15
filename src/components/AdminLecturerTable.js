import React from 'react';

const AdminLecturerTable = ({ lecturers, onEdit, onDelete }) => {
    
    const headers = [
        { key: 'identity', label: 'Lecturer Name' },
        { key: 'comms', label: 'Email' },
        { key: 'jurisdiction', label: 'Assigned Courses' },
        { key: 'commands', label: 'Actions', align: 'right' },
    ];

    if (!lecturers || lecturers.length === 0) {
        return (
            <div className="py-24 text-center bg-gray-50/50 rounded-[40px] border-4 border-dashed border-gray-100 m-10">
                <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center text-gray-200 mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
                <p className="text-xl font-black text-gray-300 italic tracking-tight">No lecturers found.</p>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-2">Awaiting Recruitment</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-hidden bg-white/50 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/50 animate-in fade-in duration-700">
                <table className="w-full border-separate border-spacing-0">
                    <thead>
                        <tr className="bg-gray-900/5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">
                            {headers.map((header, idx) => (
                                <th 
                                    key={header.key} 
                                    className={`py-6 px-10 ${header.align === 'right' ? 'text-right' : ''} ${idx === 0 ? 'rounded-tl-[40px]' : ''} ${idx === headers.length - 1 ? 'rounded-tr-[40px]' : ''}`}
                                >
                                    {header.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/50">
                        {lecturers.map((lecturer) => (
                            <tr key={lecturer.id} className="group hover:bg-white transition-all duration-300">
                                <td className="py-8 px-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                                            {lecturer.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-lg font-black text-gray-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                                                {lecturer.name}
                                            </span>
                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic opacity-60">Lecturer</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-8 px-10">
                                    <div className="flex items-center gap-2 group/email cursor-pointer">
                                        <div className="p-2 bg-gray-50 rounded-xl text-gray-400 group-hover/email:bg-indigo-50 group-hover/email:text-indigo-600 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                        </div>
                                        <span className="text-sm font-bold text-gray-600 group-hover/email:text-indigo-600 transition-colors italic">{lecturer.email}</span>
                                    </div>
                                </td>
                                
                                <td className="py-8 px-10">
                                    <div className="flex flex-wrap gap-2">
                                        {lecturer.courses && lecturer.courses.length > 0 ? (
                                            lecturer.courses.map(course => (
                                                <span key={course.id} className="inline-block bg-white border border-indigo-100 text-indigo-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm shadow-indigo-50 hover:bg-indigo-600 hover:text-white transition-all cursor-default">
                                                    {course.code}
                                                </span>
                                            )) 
                                        ) : (
                                            <span className="px-3 py-1.5 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 animate-pulse">No courses assigned</span>
                                        )}
                                    </div>
                                </td>

                                <td className="py-8 px-10 text-right">
                                    <div className="flex gap-3 justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-4">
                                        <button 
                                            onClick={() => onEdit(lecturer)} 
                                            className="p-3 bg-white border border-gray-100 text-amber-500 hover:bg-amber-500 hover:text-white rounded-2xl shadow-xl shadow-gray-100 hover:shadow-amber-100 transition-all active:scale-90"
                                            title="Edit Profile"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                        </button>
                                        <button 
                                            onClick={() => onDelete(lecturer.id)} 
                                            className="p-3 bg-white border border-gray-100 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl shadow-xl shadow-gray-100 hover:shadow-rose-100 transition-all active:scale-90"
                                            title="Delete Account"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-6 lg:hidden">
                {lecturers.map((lecturer) => (
                    <div key={lecturer.id} className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100 flex flex-col gap-6 animate-in slide-in-from-bottom-5 duration-500">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-100">
                                    {lecturer.name.charAt(0)}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none">{lecturer.name}</h3>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">Lecturer</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => onEdit(lecturer)} 
                                    className="p-3 bg-gray-50 text-amber-500 rounded-2xl border border-gray-100 active:scale-90"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                </button>
                                <button 
                                    onClick={() => onDelete(lecturer.id)} 
                                    className="p-3 bg-gray-50 text-rose-500 rounded-2xl border border-gray-100 active:scale-90"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-3xl space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl text-gray-400 border border-gray-100">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                </div>
                                <span className="text-sm font-bold text-gray-600 italic truncate">{lecturer.email}</span>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Assigned Courses</p>
                                <div className="flex flex-wrap gap-2">
                                    {lecturer.courses && lecturer.courses.length > 0 ? (
                                        lecturer.courses.map(course => (
                                            <span key={course.id} className="bg-white border border-indigo-100 text-indigo-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                                                {course.code}
                                            </span>
                                        )) 
                                    ) : (
                                        <span className="text-[10px] font-bold text-rose-500 italic pl-1">No courses assigned yet</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminLecturerTable;