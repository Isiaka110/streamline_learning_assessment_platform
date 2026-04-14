import prisma from '@lib/prisma';
import { UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@api/auth/[...nextauth]';

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== UserRole.STUDENT) {
        return res.status(403).json({ message: 'Access Denied: Student role required.' });
    }

    const userId = session.user.id;

    if (req.method === 'GET') {
        try {
            // 1. Get total enrolled classes
            const totalClasses = await prisma.enrollment.count({
                where: { studentId: userId }
            });

            // 2. Get all assignments for these courses
            const enrollments = await prisma.enrollment.findMany({
                where: { studentId: userId },
                select: { courseId: true }
            });
            const courseIds = enrollments.map(e => e.courseId);

            const totalAssignments = await prisma.assignment.count({
                where: { courseId: { in: courseIds } }
            });

            // 3. Get completed assignments (submissions by this student)
            const completedAssignments = await prisma.submission.count({
                where: { 
                    studentId: userId,
                    assignment: { courseId: { in: courseIds } }
                }
            });

            const pendingAssignments = Math.max(0, totalAssignments - completedAssignments);

            // 4. Get average grade
            const submissionsWithGrades = await prisma.submission.findMany({
                where: { 
                    studentId: userId, 
                    points: { not: null },
                    assignment: { maxPoints: { not: 0 } }
                },
                select: { 
                    points: true,
                    assignment: { select: { maxPoints: true } }
                }
            });

            let averageGrade = 0;
            if (submissionsWithGrades.length > 0) {
                const totalPercent = submissionsWithGrades.reduce((acc, sub) => {
                    return acc + (sub.points / sub.assignment.maxPoints);
                }, 0);
                averageGrade = Math.round((totalPercent / submissionsWithGrades.length) * 100);
            }

            return res.status(200).json({
                totalClasses,
                pendingAssignments,
                completedAssignments,
                averageGrade
            });

        } catch (error) {
            console.error("Student Stats Error:", error);
            return res.status(500).json({ message: 'Internal server error fetching stats.' });
        }
    }

    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
