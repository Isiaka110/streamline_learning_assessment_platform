import React, { useState, useEffect, useCallback } from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@api/auth/[...nextauth]';
import { UserRole } from '@prisma/client';
import { withAuthGuard } from '@components/AuthGuard';
import LogoContainer from '@components/LogoContainer';
import ComposeAnnouncementForm from '@components/ComposeAnnouncementForm';
import GlobalAnnouncements from '@components/GlobalAnnouncements';
import Link from 'next/link';

function AdminAnnouncementsPage({ session }) {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleAnnouncementCreated = () => {
        // Trigger a refresh of the announcements list
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-gray-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 pb-6 border-b border-gray-200 gap-6">
                <div className="flex items-center gap-4">
                    <LogoContainer />
                    <div className="h-10 w-[2px] bg-gray-200 hidden md:block"></div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Platform Communications</h1>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest italic opacity-60">Admin HQ / Broadcast Management</p>
                    </div>
                </div>
                <Link 
                    href="/dashboard/admin" 
                    className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-colors text-xs uppercase tracking-widest"
                >
                    &larr; Back to Dashboard
                </Link>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
                <div className="space-y-8">
                    <div className="bg-indigo-50/50 border border-indigo-100 p-8 rounded-[40px] mb-8">
                        <h2 className="text-xl font-black text-indigo-900 mb-4 uppercase italic">Global Reach</h2>
                        <p className="text-gray-600 font-medium leading-relaxed italic text-sm">
                            Announcements created here are instantly broadcasted to all students and lecturers. Use this channel for critical system updates, institutional news, or schedule changes.
                        </p>
                    </div>
                    <ComposeAnnouncementForm onAnnouncementCreated={handleAnnouncementCreated} />
                </div>

                <div className="bg-white/50 backdrop-blur-sm p-8 rounded-[50px] border border-gray-100">
                    <GlobalAnnouncements key={refreshKey} />
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
