import prisma from '@lib/prisma';
import { UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@api/auth/[...nextauth]';

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== UserRole.LECTURER) {
        return res.status(403).json({ message: 'Access Denied: Lecturer role required.' });
    }

    const userId = session.user.id;

    if (req.method === 'GET') {
        try {
            // 1. Get total assigned classes
            const totalClasses = await prisma.course.count({
                where: { lecturers: { some: { id: userId } } }
            });

            // 2. Get pending reviews (submissions not yet graded)
            const pendingReviews = await prisma.submission.count({
                where: {
                    assignment: {
                        course: { lecturers: { some: { id: userId } } }
                    },
                    points: null
                }
            });

            // 3. Get total unique students across all classes
            const lecturerCourses = await prisma.course.findMany({
                where: { lecturers: { some: { id: userId } } },
                select: { id: true }
            });
            const courseIds = lecturerCourses.map(c => c.id);

            const totalStudents = await prisma.enrollment.count({
                where: { courseId: { in: courseIds } }
            });

            return res.status(200).json({
                totalClasses,
                pendingReviews,
                totalStudents
            });

        } catch (error) {
            console.error("Lecturer Stats Error:", error);
            return res.status(500).json({ message: 'Internal server error fetching stats.' });
        }
    }

    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
