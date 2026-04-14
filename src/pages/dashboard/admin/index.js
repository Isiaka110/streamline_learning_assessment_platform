import React from 'react';
import { signOut } from 'next-auth/react';
import { withAuthGuard } from '@components/AuthGuard'; 
import { UserRole } from '@prisma/client';
import Link from 'next/link';
import Head from 'next/head';
import prisma from '@lib/prisma'; 
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@api/auth/[...nextauth]'; 
import NotificationBell from '@components/NotificationBell';

function AdminDashboard({ 
    totalLecturers, 
    totalCourses, 
    unassignedCourses, 
    totalStudents,
    error,
    session 
}) {
    const adminName = session?.user?.name || 'Administrator';

    const handleLogout = () => {
        signOut({ callbackUrl: '/auth/signin' }); 
    };
    
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
                <div className="p-8 border border-red-200 bg-red-50 text-red-600 rounded-[2rem] max-w-2xl w-full text-center mb-6">
                    <p className="font-bold text-sm">{error}</p>
                </div>
                <button onClick={handleLogout} className="btn-outline">Log Out</button>
            </div>
        );
    }

    const statCards = [
        { label: 'Teachers', value: totalLecturers, sub: 'Active faculty members', color: 'bg-primary' },
        { label: 'Classes', value: totalCourses, sub: 'Total curriculum items', color: 'bg-[#10B981]' },
        { label: 'Students', value: totalStudents, sub: 'Registered on platform', color: 'bg-[#8B5CF6]' },
        { label: 'Pending', value: unassignedCourses, sub: 'Unassigned classes', warn: unassignedCourses > 0, color: 'bg-[#F97316]' },
    ];

    const actionCards = [
        {
            num: '01',
            title: 'Manage Teachers',
            description: 'Account registration and class assignments.',
            href: '/dashboard/admin/lecturer-management',
            label: 'Open Registry',
            accent: false,
        },
        {
            num: '02',
            title: 'Manage Classes',
            description: 'Curriculum creation and session management.',
            href: '/dashboard/admin/course-management',
            label: 'Manage Curriculum',
            accent: true,
        },
        {
            num: '03',
            title: 'Platform Announcements',
            description: 'Broadcast messages to all students and faculty.',
            href: '/dashboard/admin/announcements',
            label: 'Send Notification',
            accent: false,
            fullWidth: true,
        },
    ];

    return (
        <div className="min-h-screen bg-background pb-20">
            <Head>
                <title>Admin Dashboard | SLA</title>
            </Head>

            {/* Header */}
            <div className="bg-white border-b border-border px-6 py-4 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-bold text-xl">S</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-foreground uppercase tracking-widest">SLA Admin</h1>
                            <p className="text-xs font-semibold text-secondary">Logged in as {adminName}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                        <NotificationBell />
                        <button onClick={handleLogout} className="btn-outline px-4 py-2.5 text-xs">
                             Log Out
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-8">

                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2 text-foreground tracking-tight">Platform Overview</h2>
                    <p className="text-secondary text-sm font-semibold uppercase tracking-widest opacity-60">
                        Real-time system diagnostics and administrative controls.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {statCards.map((stat, i) => (
                        <div key={i} className={`${stat.color} text-white rounded-[2rem] p-8 shadow-md relative overflow-hidden`}>
                            <div className="relative z-10">
                               <p className="text-sm font-bold opacity-80 mb-2 uppercase tracking-widest">{stat.label}</p>
                               <div className="text-5xl font-bold mb-2">
                                   {stat.value ?? '—'}
                               </div>
                               <p className="text-xs opacity-90 font-bold uppercase tracking-tight">{stat.sub}</p>
                               {stat.warn && (
                                   <div className="mt-3 inline-block px-3 py-1 bg-white/20 rounded-full">
                                       <span className="text-[10px] font-bold shrink-0 uppercase tracking-widest">Critical</span>
                                   </div>
                               )}
                            </div>
                            <div className="absolute right-0 bottom-0 w-24 h-24 bg-white/10 rounded-tl-full translate-x-4 translate-y-4 z-0"></div>
                        </div>
                    ))}
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {actionCards.map((card) => (
                        <div
                            key={card.num}
                            className={`${card.fullWidth ? 'md:col-span-2' : ''} group bg-white rounded-[2.5rem] border border-border p-10 flex flex-col justify-between gap-8 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden`}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full translate-x-10 -translate-y-10 group-hover:bg-primary/5 transition-colors"></div>
                            
                            <div className="relative z-10">
                                <div className="text-5xl font-bold text-gray-100 mb-4 group-hover:text-primary/10 transition-colors">
                                    {card.num}
                                </div>
                                <h3 className="text-3xl font-bold text-foreground mb-3 tracking-tight">
                                    {card.title}
                                </h3>
                                <p className="text-lg text-secondary font-semibold italic opacity-80">
                                    {card.description}
                                </p>
                            </div>
                            <Link
                                href={card.href}
                                className={`btn-primary self-start py-4 px-8 text-xs uppercase tracking-widest ${!card.accent ? 'bg-secondary' : ''}`}
                            >
                                {card.label}
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Platform Mission Card */}
                <div className="mt-12 bg-gray-50 rounded-[2.5rem] p-12 border border-border shadow-sm flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-shrink-0 w-24 h-24 bg-primary/10 text-primary rounded-3xl flex items-center justify-center animate-pulse">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-3xl font-bold text-foreground mb-4 tracking-tight">Sustainable Digital Transformation</h3>
                        <p className="text-lg text-secondary leading-relaxed font-semibold italic opacity-80">
                            "The SLA administrative hub provides oversight of the institutional transition from paper to digital. Monitor faculty engagement and curriculum deployment in real-time."
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export async function getServerSideProps(context) {
    const session = await getServerSession(context.req, context.res, authOptions);

    if (!session || session.user.role !== UserRole.ADMIN) {
        return {
            redirect: {
                destination: '/auth/signin?error=AccessDenied',
                permanent: false,
            },
        };
    }

    let totalLecturers = 0;
    let totalCourses = 0;
    let unassignedCourses = 0;
    let totalStudents = 0;
    let error = null;

    try {
        totalLecturers = await prisma.user.count({ where: { role: UserRole.LECTURER } });
        totalCourses = await prisma.course.count();
        unassignedCourses = await prisma.course.count({ where: { lecturers: { none: {} } } });
        totalStudents = await prisma.user.count({ where: { role: UserRole.STUDENT } });
    } catch (err) {
        console.error("getServerSideProps Admin Stats Error:", err);
        error = 'Failed to load system pulse from the database.';
    }

    return {
        props: {
            totalLecturers,
            totalCourses,
            unassignedCourses,
            totalStudents,
            error, 
            session: JSON.parse(JSON.stringify(session)), 
        },
    };
}

export default withAuthGuard(AdminDashboard, [UserRole.ADMIN]);