// pages/api/student/courses.js

import prisma from '../prisma'; // Adjust path if needed
import { UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@api/auth/[...nextauth]'; // Adjust path if needed

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== UserRole.STUDENT) {
        return res.status(403).json({ message: 'Access Denied: Student role required.' });
    }

    const userId = session.user.id;

    if (req.method === 'GET') {
        try {
            const studentEnrollments = await prisma.enrollment.findMany({
                where: { studentId: userId },
                select: {
                    course: {
                        select: {
                            id: true,
                            title: true,
                            code: true,
                            description: true,
                            // These fields are now available in the schema
                            semester: true, 
                            year: true,
                            
                            lecturers: { // Plural relationship name is correct
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            },
                            _count: {
                                select: { assignments: true }
                            },
                        }
                    }
                },
                // No invalid orderBy included
            });

            // Data mapping and JavaScript sorting
            const courses = studentEnrollments
                .filter(enrollment => enrollment.course)
                .map(enrollment => ({
                    ...enrollment.course,
                    assignmentsCount: enrollment.course._count.assignments,
                }));
            
            courses.sort((a, b) => b.year - a.year || a.semester.localeCompare(b.semester));

            return res.status(200).json({ courses });

        } catch (error) {
            console.error("API Fetch Enrolled Courses Database Error:", error);
            return res.status(500).json({ 
                message: 'Failed to fetch enrolled courses due to a server error.',
                details: error.message
            });
        }
    }

    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}