// pages/api/admin/announcements/index.js

import prisma from '@api/prisma'; // Adjust path as per your project structure
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@api/auth/[...nextauth]'; // Adjust path as per your project structure
import { UserRole } from '@prisma/client';

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);

    // 1. Authentication and Authorization Check (Only Admin can post)
    if (!session || session.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Access Denied: Admin role required to post announcements.' });
    }

    // --- POST: Create a new Announcement ---
    if (req.method === 'POST') {
        const { title, content } = req.body;

        // 2. Input Validation
        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required for the announcement.' });
        }
        
        // Ensure content is not excessively long (optional, but good practice)
        if (title.length > 255) {
            return res.status(400).json({ message: 'Title cannot exceed 255 characters.' });
        }

        try {
            const newAnnouncement = await prisma.announcement.create({
                data: {
                    title: title,
                    content: content,
                    // Note: You might want to store the author's ID here (session.user.id)
                    // If you add a 'creatorId' field to your Announcement model.
                },
                select: {
                    id: true,
                    title: true,
                    createdAt: true
                }
            });

            // The announcement is now saved and ready to be displayed on student/lecturer dashboards
            return res.status(201).json({ 
                message: 'Announcement successfully created and broadcasted.', 
                announcement: newAnnouncement 
            });

        } catch (error) {
            console.error("API Post Announcement Error:", error);
            return res.status(500).json({ message: 'Failed to post announcement. Internal server error.' });
        }
    }

    // 3. Handle Unsupported Methods
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}