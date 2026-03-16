import React from 'react';
import { signOut } from 'next-auth/react';
import { withAuthGuard } from '@components/AuthGuard'; 
import LogoContainer from '@components/LogoContainer';
import { UserRole } from '@prisma/client';
import Link from 'next/link';
import prisma from '@lib/prisma'; 
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@api/auth/[...nextauth]'; 


function AdminDashboard({ 
    totalLecturers, 
    totalCourses, 
    unassignedCourses, 
    error,
    session 
}) {

    const handleLogout = () => {
        signOut({ callbackUrl: '/auth/signin' }); 
    };
    
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
                <p className="p-4 bg-red-100 text-red-700 border border-red-300 rounded max-w-2xl text-center mb-6">{error}</p>
                <button onClick={handleLogout} className="px-6 py-2 bg-red-500 text-white font-semibold rounded hover:bg-red-600 transition-colors">Logout</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row items-start md:items-center order-1 md:order-1 mb-4 md:mb-0"> 
                    <div className="flex items-center">
                        <LogoContainer /> 
                        <span className="text-2xl font-black text-indigo-600 hidden md:block ml-3 tracking-wide mt-1">LMS</span> 
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 md:ml-4 mt-2 md:mt-0 order-3 md:order-2">Admin Dashboard ⚙️</h1>
                </div>
                
                <button onClick={handleLogout} className="md:order-3 order-2 mt-2 md:mt-0 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow-md transition-colors text-sm">
                    Logout 🚪
                </button>
            </div>
            
            <p className="text-gray-600 mb-8 border-b border-gray-200 pb-4">
                Welcome, {session?.user?.name || 'System Administrator'}. Centralize and optimize platform operations and user access.
            </p>

            {/* MAIN GRID LAYOUT - Strictly the 3 requested cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Manage Lecturers (C.R.U.D.) */}
                <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Manage Lecturers 🧑‍🏫</h2>
                        <p className="text-gray-600 font-medium mb-2">
                            Total Lecturers: <span className="text-gray-900 font-bold ml-1 text-lg">
                                {totalLecturers}
                            </span>
                        </p>
                        <p className="text-gray-500 mb-6">Centralize management for all platform lecturers, including creation and assignment details.</p>
                    </div>
                    <Link href="/dashboard/admin/lecturer-management" className="text-center block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-sm"> 
                        Manage Lecturers
                    </Link>
                </div>

                {/* 2. Manage Course Catalog */}
                <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Manage Course Catalog 📚</h2>
                        <p className="text-gray-600 font-medium mb-2">
                            Total Active Courses: <span className="text-gray-900 font-bold ml-1 text-lg">
                                {totalCourses}
                            </span>
                        </p>
                        <p className="text-gray-600 font-medium mb-2">
                            Courses Needing Lecturer: <span className={`font-bold ml-1 text-lg ${unassignedCourses > 0 ? 'text-red-500' : 'text-gray-900'}`}>
                                {unassignedCourses}
                            </span>
                        </p>
                        <p className="text-gray-500 mb-6">Create, update, and manage the course catalog, and assign lecturers to courses.</p>
                    </div>
                    <Link href="/dashboard/admin/course-management" className="text-center block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-sm"> 
                        Manage Courses & Assignments
                    </Link>
                </div>
                
                {/* 3. System-Wide Announcements (Full-width action) */}
                <div className="md:col-span-2 bg-blue-50 border border-blue-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">System-Wide Announcements 📣</h2>
                        <p className="text-gray-600 mb-6 border-b border-blue-200/50 pb-4">Push critical updates and notifications to all platform users.</p>
                    </div>
                    <Link href="/dashboard/admin/announcements" className="text-center md:self-start md:px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-md shadow-blue-500/20">
                        Manage Platform Announcements
                    </Link>
                </div>

            </div>
        </div>
    );
}

export async function getServerSideProps(context) {
    const session = await getServerSession(context.req, context.res, authOptions);

    if (!session || session.user.role !== UserRole.ADMIN) {
        return {
            redirect: {
                destination: '/auth/SignIn?error=AccessDenied',
                permanent: false,
            },
        };
    }

    if (session?.user) {
        session.user.image = session.user.image ?? null;
        session.user.name = session.user.name ?? null;
    }

    let totalLecturers = 0;
    let totalCourses = 0;
    let unassignedCourses = 0;
    let error = null;

    try {
        totalLecturers = await prisma.user.count({
            where: {
                role: UserRole.LECTURER,
            },
        });

        totalCourses = await prisma.course.count();

        unassignedCourses = await prisma.course.count({
            where: {
                lecturers: { 
                    none: {} 
                }
            }
        });

    } catch (err) {
        console.error("getServerSideProps Admin Stats Error:", err);
        error = 'Failed to load administrator statistics from the database.';
    }

    return {
        props: {
            totalLecturers,
            totalCourses,
            unassignedCourses,
            error, 
            session: JSON.parse(JSON.stringify(session)), 
        },
    };
}

export default withAuthGuard(AdminDashboard, [UserRole.ADMIN]);