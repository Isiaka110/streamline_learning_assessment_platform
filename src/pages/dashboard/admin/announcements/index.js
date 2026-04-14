import React, { useState, useEffect, useCallback } from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@api/auth/[...nextauth]';
import { UserRole } from '@prisma/client';
import { withAuthGuard } from '@components/AuthGuard';
import LogoContainer from '@components/LogoContainer';
import ComposeAnnouncementForm from '@components/ComposeAnnouncementForm';
import GlobalAnnouncements from '@components/GlobalAnnouncements';
import NotificationBell from '@components/NotificationBell';
import Link from 'next/link';
import Head from 'next/head';

function AdminAnnouncementsPage({ session }) {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleAnnouncementCreated = () => {
        // Trigger a refresh of the announcements list
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <Head>
                <title>Messages Management | SLA</title>
            </Head>

            <div className="bg-white border-b border-border px-6 sticky top-0 z-40 shadow-sm h-16 flex items-center">
                <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <LogoContainer />
                        <h1 className="text-xl font-bold tracking-tight text-foreground hidden sm:block uppercase tracking-widest">Admin COMMS</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <Link 
                            href="/dashboard/admin" 
                            className="btn-outline px-4 py-2 text-[10px] font-bold uppercase tracking-widest"
                        >
                            &larr; Hub
                        </Link>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2 text-foreground tracking-tight">System Broadcast</h2>
                    <p className="text-secondary text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                        Post announcements for all students and faculty.
                    </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-start mt-12">
                    <div className="space-y-8">
                        <div className="bg-blue-600 p-8 rounded-[2rem] text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full translate-x-4 -translate-y-4"></div>
                            <h2 className="text-xl font-bold mb-2 tracking-tight">Institutional Outreach</h2>
                            <p className="text-white/80 font-semibold text-xs leading-relaxed italic">
                                "Messages shared here are visible to all students and faculty instantly. Use this for general updates or university news."
                            </p>
                        </div>
                        <ComposeAnnouncementForm onAnnouncementCreated={handleAnnouncementCreated} />
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] border border-border shadow-sm">
                        <GlobalAnnouncements key={refreshKey} />
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

    return {
        props: {
            session: JSON.parse(JSON.stringify(session)),
        },
    };
}

export default withAuthGuard(AdminAnnouncementsPage, [UserRole.ADMIN]);
