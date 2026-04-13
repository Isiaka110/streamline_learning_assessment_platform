import React from 'react';
import { signOut } from 'next-auth/react';
import { withAuthGuard } from '@components/AuthGuard'; 
import { UserRole } from '@prisma/client';
import Link from 'next/link';
import Head from 'next/head';
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
    const adminName = session?.user?.name || 'System Administrator';

    const handleLogout = () => {
        signOut({ callbackUrl: '/auth/signin' }); 
    };
    
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
                <div className="p-8 border-2 border-red-500 bg-red-50 text-red-900 max-w-2xl w-full text-center mb-6">
                    <p className="font-black italic uppercase text-sm">{error}</p>
                </div>
                <button onClick={handleLogout} className="btn-rect-outline">Terminate Session</button>
            </div>
        );
    }

    const statCards = [
        { label: 'Faculty Members', value: totalLecturers, sub: 'Active instructors on platform' },
        { label: 'Active Modules', value: totalCourses, sub: 'Total course catalog entries' },
        { label: 'Unassigned Modules', value: unassignedCourses, sub: 'Awaiting instructor assignment', warn: unassignedCourses > 0 },
    ];

    const actionCards = [
        {
            num: '01',
            title: 'Faculty Management',
            description: 'Provision, update, and govern all instructor accounts. Control course-faculty assignments.',
            href: '/dashboard/admin/lecturer-management',
            label: 'Manage Faculty',
            accent: false,
        },
        {
            num: '02',
            title: 'Course Catalog',
            description: 'Build and maintain the institutional module catalog. Define credits, semesters, and lecturer assignments.',
            href: '/dashboard/admin/course-management',
            label: 'Manage Modules',
            accent: true,
        },
        {
            num: '03',
            title: 'Platform Broadcasts',
            description: 'Publish system-wide announcements and targeted advisories to all platform user roles.',
            href: '/dashboard/admin/announcements',
            label: 'Manage Broadcasts',
            accent: false,
            fullWidth: true,
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Head>
                <title>Admin Console | Streamline LMS</title>
            </Head>

            {/* Header */}
            <div className="glass border-b border-foreground/10 px-6 py-6 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-foreground flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-black italic text-sm">SL</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none">Admin Console</h1>
                            <p className="text-[10px] font-bold text-accent uppercase tracking-widest mt-0.5">{adminName} | SUPERUSER</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn-rect-outline px-4 py-2 text-xs">
                        Terminate Session
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12">

                {/* Title */}
                <div className="mb-12">
                    <h2 className="text-3xl md:text-5xl mb-2">Platform Governance</h2>
                    <p className="text-secondary font-medium italic">
                        Centralize operations, manage faculty, and govern the institutional ecosystem.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-2 border-foreground mb-12">
                    {statCards.map((stat, i) => (
                        <div key={i} className={`p-8 ${i < statCards.length - 1 ? 'border-b sm:border-b-0 sm:border-r border-foreground/20' : ''}`}>
                            <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-2">{stat.label}</p>
                            <p className={`text-5xl font-black italic mb-1 ${stat.warn ? 'text-red-500' : 'text-foreground'}`}>
                                {stat.value ?? '—'}
                            </p>
                            <p className="text-xs text-secondary font-medium">{stat.sub}</p>
                            {stat.warn && (
                                <div className="mt-3 inline-block px-2 py-0.5 bg-red-100 border border-red-300">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-red-600">Action Required</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {actionCards.map((card) => (
                        <div
                            key={card.num}
                            className={`${card.fullWidth ? 'md:col-span-2' : ''} ${card.accent ? 'bg-foreground text-white' : 'bg-white border-2 border-foreground/10'} p-10 flex flex-col justify-between gap-8 group hover:shadow-2xl transition-shadow duration-300`}
                        >
                            <div>
                                <div className={`text-4xl font-black italic mb-4 ${card.accent ? 'text-accent' : 'text-foreground/20'}`}>
                                    {card.num}
                                </div>
                                <h3 className={`text-2xl font-black italic uppercase mb-3 ${card.accent ? 'text-white' : 'text-foreground'}`}>
                                    {card.title}
                                </h3>
                                <p className={`text-sm leading-relaxed font-medium ${card.accent ? 'text-white/50' : 'text-secondary'}`}>
                                    {card.description}
                                </p>
                            </div>
                            <Link
                                href={card.href}
                                className={`btn-rect self-start ${card.accent ? 'bg-accent border-accent text-white hover:bg-white hover:text-foreground hover:border-white' : 'bg-foreground text-white border-foreground hover:bg-accent hover:border-accent'}`}
                            >
                                {card.label}
                            </Link>
                        </div>
                    ))}
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

    if (session?.user) {
        session.user.image = session.user.image ?? null;
        session.user.name = session.user.name ?? null;
    }

    let totalLecturers = 0;
    let totalCourses = 0;
    let unassignedCourses = 0;
    let error = null;

    try {
        totalLecturers = await prisma.user.count({ where: { role: UserRole.LECTURER } });
        totalCourses = await prisma.course.count();
        unassignedCourses = await prisma.course.count({ where: { lecturers: { none: {} } } });
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