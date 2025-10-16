// pages/api/lecturer/students.js
import { checkLecturerCourseAccess } from '@api/utils/auth-check';
import prisma from '@api/prisma';
import { UserRole } from '@prisma/client';

export default async function handler(req, res) {
    const { courseId } = req.query;
    const session = await checkLecturerCourseAccess(req, res, courseId);
    if (!session) return;

    // --- GET: Fetch all students enrolled in the selected course ---
    if (req.method === 'GET') {
        try {
            const students = await prisma.user.findMany({
                where: {
                    role: UserRole.STUDENT,
                    // Filter users who have an enrollment in this specific course
                    enrollments: {
                        some: {
                            courseId: courseId
                        }
                    }
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
                orderBy: { name: 'asc' }
            });

            return res.status(200).json({ students });
        } catch (error) {
            console.error("API Error (GET students):", error);
            return res.status(500).json({ message: 'Failed to load student list.' });
        }
    }

    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}