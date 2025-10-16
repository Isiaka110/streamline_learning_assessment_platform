import { PrismaClient, UserRole } from '@prisma/client';
import { getSession } from 'next-auth/react';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const session = await getSession({ req });

    // 1. Authentication and Role Check
    if (!session || session.user.role !== UserRole.LECTURER) {
        return res.status(403).json({ message: 'Access Denied.' });
    }

    const lecturerId = session.user.id;
    
    // --- UPDATE (U) OPERATION ---
    if (req.method === 'PUT') {
        const { name, email, oldPassword, newPassword } = req.body;
        const data = {};

        try {
            // Fetch current user data for password verification
            const user = await prisma.user.findUnique({ where: { id: lecturerId } });
            if (!user) return res.status(404).json({ message: 'User not found.' });

            // Check if user is trying to change the password
            if (newPassword) {
                // 2. Verify Old Password (Security Check)
                const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
                if (!isPasswordValid) {
                    return res.status(401).json({ message: 'Incorrect old password.' });
                }
                data.password = await bcrypt.hash(newPassword, 10);
            }

            // Apply other updates
            if (name) data.name = name;
            if (email) data.email = email;

            const updatedUser = await prisma.user.update({
                where: { id: lecturerId },
                data: data,
                select: { id: true, name: true, email: true }, // Don't return password hash
            });

            return res.status(200).json({ message: 'Profile updated successfully.', user: updatedUser });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to update profile.' });
        }
    }
    
    // --- READ (R) Operation ---
    if (req.method === 'GET') {
        try {
            const user = await prisma.user.findUnique({
                where: { id: lecturerId },
                select: { id: true, name: true, email: true, createdAt: true }, 
            });
            return res.status(200).json({ user });
        } catch (error) {
            return res.status(500).json({ message: 'Failed to fetch profile data.' });
        }
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
}