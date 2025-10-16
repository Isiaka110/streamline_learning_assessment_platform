// pages/api/admin/users.js

import prisma from '@api/prisma'; // Adjust path if needed
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@api/auth/[...nextauth]';
import { UserRole } from '@prisma/client';

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Access Denied: Admin role required.' });
    }

    // --- GET: Fetch Users (Lecturers) ---
    if (req.method === 'GET') {
        const { role } = req.query; 
        try {
            const users = await prisma.user.findMany({
                where: role ? { role: role } : {},
                select: { 
                    id: true, 
                    name: true, 
                    email: true, 
                    role: true, 
                    createdAt: true, 
                    // 🔑 FIX: Include the courses taught by this lecturer (Required for the table)
                    courses: {
                        select: {
                            id: true,
                            code: true, 
                            title: true,
                        }
                    }
                },
                orderBy: { name: 'asc' }
            });
            return res.status(200).json({ users });
        } catch (error) {
            console.error("API Fetch Users Error:", error);
            return res.status(500).json({ message: 'Failed to fetch users.' });
        }
    }

    // --- DELETE: Delete a User ---
    if (req.method === 'DELETE') {
        // ... (Deletion logic remains the same) ...
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ message: 'Missing required userId query parameter.' });
        }

        try {
            await prisma.user.delete({
                where: { id: userId },
            });
            return res.status(200).json({ message: 'User deleted successfully.' });

        } catch (error) {
            console.error("Admin API DELETE User Error:", error);
             if (error.code === 'P2025') {
                 return res.status(404).json({ message: 'User not found or already deleted.' });
            }
            return res.status(500).json({ message: 'Failed to delete user.' });
        }
    }

    res.setHeader('Allow', ['GET', 'DELETE']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}