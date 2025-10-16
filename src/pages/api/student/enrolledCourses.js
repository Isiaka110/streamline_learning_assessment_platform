// pages/api/student/enrolledCourses.js

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

    if (req.method === 'GET') {
        try {
            const enrollments = await prisma.enrollment.findMany({
                where: { studentId: studentId },
                include: {
                    course: {
                        include: {
                            lecturers: { // Include lecturer data for the course card
                                select: {
                                    id: true,
                                    name: true,
                                }
                            }
                        }
                    }
                }
            });

            const enrolledCourses = enrollments.map(enrollment => enrollment.course);

            return res.status(200).json({ courses: enrolledCourses });

        } catch (error) {
            console.error("API Get Student Enrolled Courses Error:", error);
            return res.status(500).json({ message: 'Failed to fetch enrolled courses.' });
        }
    }

    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}