import React from 'react';

function AssignmentTable({ assignments, onEdit, onDelete, onGrade }) { 
    if (!assignments || assignments.length === 0) {
        return (
            <div className="py-20 text-center bg-gray-50/50 rounded-[40px] border-4 border-dashed border-gray-100 m-8 animate-in fade-in zoom-in-95 duration-700">
                <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center text-gray-200 mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                <p className="text-xl font-black text-gray-300 italic tracking-tight">No assessment directives established.</p>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-2 animate-bounce">Awaiting New Assignment Protocol</p>
            </div>
        );
    }

    return (
        <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-hidden bg-white/50 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/50 animate-in fade-in duration-700">
                <table className="w-full border-separate border-spacing-0">
                    <thead>
                        <tr className="bg-gray-900/5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">
                            <th className="py-6 px-10 rounded-tl-[40px]">Strategic Title</th>
                            <th className="py-6 px-10 text-center">Deadline Protocol</th>
                            <th className="py-6 px-10 text-center">Inbound Artifacts</th>
                            <th className="py-6 px-10 text-center">Pending Review</th>
                            <th className="py-6 px-10 text-right rounded-tr-[40px]">Operational Commands</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/50">
                        {assignments.map((assignment) => {
                            const needsGrading = Math.max(0, (assignment.submissions || 0) - (assignment.graded || 0));
                            return (
                                <tr key={assignment.id} className="group hover:bg-white transition-all duration-300">
                                    <td className="py-8 px-10">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xl font-black text-gray-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                                                {assignment.title}
                                            </span>
                                            <div className="flex items-center gap-2 mt-2 opacity-60">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Operative</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-8 px-10 text-center">
                                        <div className="inline-flex flex-col items-center bg-gray-50 px-4 py-2 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                                            <span className="text-sm font-black text-gray-700 group-hover:text-indigo-700">
                                                {new Date(assignment.dueDate).toLocaleDateString('en-GB')}
                                            </span>
                                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter mt-0.5">Termination Date</span>
                                        </div>
                                    </td>
                                    <td className="py-8 px-10 text-center text-2xl font-black text-gray-900 tabular-nums">
                                        {assignment.submissions || 0}
                                    </td>
                                    <td className="py-8 px-10 text-center">
                                        <span className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl font-black text-xl shadow-inner tabular-nums ${needsGrading > 0 ? 'bg-rose-50 text-rose-500 animate-pulse' : 'bg-emerald-50 text-emerald-500'}`}>
                                            {needsGrading}
                                        </span>
                                    </td>
                                    <td className="py-8 px-10 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <button 
                                                onClick={() => onGrade(assignment)} 
                                                className="px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-black transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-[10px]"
                                            >
                                                Assess Data
                                            </button>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                                                <button 
                                                    onClick={() => onEdit(assignment)} 
                                                    className="p-3 bg-white border border-gray-100 text-amber-500 hover:bg-amber-500 hover:text-white rounded-2xl shadow-xl shadow-gray-100 hover:shadow-amber-100 transition-all active:scale-90"
                                                    title="Modify Directives"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                </button>
                                                <button 
                                                    onClick={() => onDelete(assignment.id, assignment.title)} 
                                                    className="p-3 bg-white border border-gray-100 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl shadow-xl shadow-gray-100 hover:shadow-rose-100 transition-all active:scale-90"
                                                    title="Erase Directive"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-6 lg:hidden">
                {assignments.map((assignment) => {
                    const needsGrading = Math.max(0, (assignment.submissions || 0) - (assignment.graded || 0));
                    return (
                        <div key={assignment.id} className="bg-white rounded-3xl p-6 shadow-xl border border-gray-50 flex flex-col gap-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none italic">{assignment.title}</h3>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Directive ID: {assignment.id.substring(0,6)}</p>
                                </div>
                                <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest italic ${needsGrading > 0 ? 'bg-rose-50 text-rose-500 border border-rose-100 animate-pulse' : 'bg-emerald-50 text-emerald-500 border border-emerald-100'}`}>
                                    {needsGrading > 0 ? `${needsGrading} Pending` : 'All Graded'}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 bg-gray-50 p-4 rounded-2xl">
                                <div className="text-center">
                                    <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest italic mb-1">Deadline</p>
                                    <p className="text-[10px] font-black text-gray-700 uppercase">{new Date(assignment.dueDate).toLocaleDateString()}</p>
                                </div>
                                <div className="text-center border-x border-gray-200">
                                    <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest italic mb-1">Inbound</p>
                                    <p className="text-lg font-black text-gray-900 leading-none">{assignment.submissions || 0}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest italic mb-1">Validated</p>
                                    <p className="text-lg font-black text-emerald-600 leading-none">{assignment.graded || 0}</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button 
                                    onClick={() => onGrade(assignment)} 
                                    className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95 uppercase tracking-widest text-[9px] flex items-center justify-center gap-2"
                                >
                                    Grade Work
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                                </button>
                                <button 
                                    onClick={() => onEdit(assignment)} 
                                    className="p-4 bg-gray-50 text-amber-500 rounded-2xl border border-gray-100 active:scale-90"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                </button>
                                <button 
                                    onClick={() => onDelete(assignment.id, assignment.title)} 
                                    className="p-4 bg-gray-50 text-rose-500 rounded-2xl border border-gray-100 active:scale-90"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

export default AssignmentTable;