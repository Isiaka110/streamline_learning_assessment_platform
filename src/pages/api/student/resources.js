// pages/api/student/resources.js (New File)

import prisma from '@api/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@api/auth/[...nextauth]';
import { UserRole } from '@prisma/client';


export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== UserRole.STUDENT) {
        return res.status(403).json({ message: 'Access Denied: Student role required.' });
    }

    const studentId = session.user.id;
    const { courseId } = req.query;

    if (req.method === 'GET') {
        if (!courseId) {
            return res.status(400).json({ message: 'Course ID is required to fetch resources.' });
        }

        try {
            // Verify student is enrolled in the course
            const enrollment = await prisma.enrollment.findFirst({
                where: {
                    studentId: studentId,
                    courseId: courseId,
                },
            });

            if (!enrollment) {
                return res.status(403).json({ message: 'Not enrolled in this course.' });
            }

            const resources = await prisma.resource.findMany({
                where: { courseId: courseId },
                orderBy: { uploadedAt: 'desc' },
            });
            
            return res.status(200).json({ resources });

        } catch (error) {
            console.error("API Get Student Resources Error:", error);
            return res.status(500).json({ message: 'Failed to fetch resources.' });
        }
    }

    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}