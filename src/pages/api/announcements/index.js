// pages/api/announcements/index.js

import prisma from '@api/prisma'; // Adjust path as per your project structure
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@api/auth/[...nextauth]'; // Adjust path as per your project structure

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);

    // 1. Authentication Check (Any logged-in user can view announcements)
    if (!session) {
        return res.status(401).json({ message: 'Unauthorized access.' });
    }

    // --- GET: Fetch all Announcements ---
    if (req.method === 'GET') {
        try {
            const announcements = await prisma.announcement.findMany({
                orderBy: {
                    createdAt: 'desc', // Show newest announcements first
                },
                take: 10, // Limit to the 10 most recent announcements
            });
            
            return res.status(200).json({ announcements });

        } catch (error) {
            console.error("API Fetch Announcements Error:", error);
            return res.status(500).json({ message: 'Failed to fetch announcements. Internal server error.' });
        }
    }

    // 2. Handle Unsupported Methods
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}