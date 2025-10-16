import prisma from '../../api/prisma'; // 🔑 Use the helper
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);

    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    if (!session) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    try {
        const announcements = await prisma.announcement.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                title: true,
                content: true,
                createdAt: true,
            }
        });

        return res.status(200).json({ announcements });

    } catch (error) {
        console.error("API Fetch Announcements Database Error:", error);
        // This catch block ensures *any* internal server error returns JSON, not HTML.
        return res.status(500).json({ 
            message: 'Failed to fetch announcements due to server error.' 
        });
    }
}