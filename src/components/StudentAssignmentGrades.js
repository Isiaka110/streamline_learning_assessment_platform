import React from 'react';

function StudentAssignmentGrades({ courses }) {
    
    // Mock Data
    const mockAssignments = [
        { id: 1, courseCode: 'CS101', title: 'Data Structures Final', dueDate: '2025-10-15', status: 'Pending Submission', grade: null },
        { id: 2, courseCode: 'MATH202', title: 'Calculus Quiz 3', dueDate: '2025-10-18', status: 'Graded', grade: 85, feedback: "Good effort, see notes on Q4." },
        { id: 3, courseCode: 'LIT305', title: 'Poetry Analysis Essay', dueDate: '2025-10-22', status: 'Pending Grade', grade: null },
    ];
    
    const assignmentsDueThisWeek = mockAssignments.filter(a => a.status === 'Pending Submission').length;

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="bg-indigo-600 p-10 rounded-[40px] shadow-2xl relative overflow-hidden group transition-all duration-500">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-x-20 -translate-y-20 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-sm">Academic Update</span>
                        </div>
                        <h3 className="text-4xl font-black text-white tracking-tighter leading-none">Assignment Overview</h3>
                        <p className="text-indigo-100/80 text-lg font-medium max-w-xl">
                            You have <strong className="text-white underline decoration-rose-500 decoration-4 underline-offset-8">{assignmentsDueThisWeek} pending assignments</strong> that need your attention.
                        </p>
                    </div>
                    <button className="px-10 py-5 bg-white text-indigo-600 font-black rounded-3xl shadow-2xl hover:bg-black hover:text-white transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-[10px] whitespace-nowrap">
                        View Deadlines
                    </button>
                </div>
            </div>

            <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase shrink-0">Your Grades</h3>
                    <div className="h-px bg-gray-100 flex-1 mx-8 hidden md:block"></div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Recent Submissions</p>
                </div>

                <div className="overflow-hidden bg-white rounded-[40px] shadow-2xl shadow-gray-100 border border-gray-100">
                    <table className="w-full border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">
                                <th className="py-6 px-8 rounded-tl-[40px]">Course</th>
                                <th className="py-6 px-8">Assignment</th>
                                <th className="py-6 px-8">Due Date</th>
                                <th className="py-6 px-8">Status</th>
                                <th className="py-6 px-8 text-center">Grade</th>
                                <th className="py-6 px-8 text-right rounded-tr-[40px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {mockAssignments.map(assignment => (
                                <tr key={assignment.id} className="group hover:bg-indigo-50/30 transition-all duration-300">
                                    <td className="py-8 px-8 whitespace-nowrap">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            {assignment.courseCode}
                                        </span>
                                    </td>
                                    <td className="py-8 px-8">
                                        <p className="font-black text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors uppercase italic underline decoration-indigo-100 decoration-2 underline-offset-4">{assignment.title}</p>
                                    </td>
                                    <td className="py-8 px-8 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-gray-700">{new Date(assignment.dueDate).toLocaleDateString('en-GB')}</span>
                                        </div>
                                    </td>
                                    <td className="py-8 px-8">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            assignment.status === 'Graded' ? 'bg-emerald-50 text-emerald-600' : 
                                            (assignment.status === 'Pending Submission' ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-indigo-50 text-indigo-600')
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${
                                                assignment.status === 'Graded' ? 'bg-emerald-500' : 
                                                (assignment.status === 'Pending Submission' ? 'bg-amber-500' : 'bg-indigo-500')
                                            }`}></div>
                                            {assignment.status}
                                        </div>
                                    </td>
                                    <td className="py-8 px-8 text-center">
                                        <span className={`text-2xl font-black tabular-nums ${assignment.grade >= 70 ? 'text-emerald-500' : (assignment.grade ? 'text-rose-500' : 'text-gray-200 italic')}`}>
                                            {assignment.grade || '--'}
                                        </span>
                                        {assignment.grade && <span className="text-[10px] font-black text-gray-400 ml-1 uppercase">pts</span>}
                                    </td>
                                    <td className="py-8 px-8 text-right whitespace-nowrap">
                                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                            {assignment.status === 'Pending Submission' && (
                                                <button className="px-5 py-2.5 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-100 hover:bg-black transition-all hover:scale-105 uppercase tracking-widest text-[9px]">
                                                    Submit
                                                </button>
                                            )}
                                            {assignment.grade && (
                                                <button className="px-5 py-2.5 bg-white border border-gray-100 text-emerald-600 font-black rounded-xl shadow-lg shadow-gray-100 hover:bg-emerald-600 hover:text-white transition-all hover:scale-105 uppercase tracking-widest text-[9px]">
                                                    Feedback
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default StudentAssignmentGrades;