// pages/api/admin/courses.js

import prisma from '@api/prisma'; // Adjusted path
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@api/auth/[...nextauth]'; // Adjusted path
import { UserRole } from '@prisma/client';

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Access Denied: Admin role required.' });
    }

    if (req.method === 'GET') {
        try {
            const courses = await prisma.course.findMany({
                select: {
                    id: true,
                    code: true,
                    title: true,
                },
                orderBy: { title: 'asc' }
            });
            return res.status(200).json({ courses });
        } catch (error) {
            console.error("API Fetch Courses Error:", error);
            return res.status(500).json({ message: 'Failed to fetch courses.' });
        }
    }

    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}