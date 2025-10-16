// File: pages/api/lecturer/courses/[courseId]/students.js

import prisma from '@api/prisma'; 
import { UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]'; 

/**
 * Checks if the authenticated user is a LECTURER and is assigned to the course.
 */
async function checkLecturerCourseAccess(req, res, courseId) {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user || session.user.role !== UserRole.LECTURER) {
        res.status(403).json({ message: 'Forbidden or Unauthorized access.' });
        return null;
    }

    if (!courseId) {
         res.status(400).json({ message: 'Course ID is missing for access check.' });
         return null;
    }

    try {
        const course = await prisma.course.findUnique({
            where: { 
                id: courseId, 
                // 🔑 FIX: Use the relational filter for the 'lecturers' many-to-many field
                lecturers: {
                    some: {
                        id: session.user.id
                    }
                }
            },
        });

        if (!course) {
            res.status(404).json({ message: 'Course not found or Lecturer not assigned.' });
            return null;
        }

        return session;
    } catch (error) {
        console.error("Authorization Check Database Error:", error);
        res.status(500).json({ 
            message: 'Internal server error during authorization check.', 
            details: error.message 
        });
        return null;
    }
}


export default async function handler(req, res) {
    const { courseId } = req.query;

    const session = await checkLecturerCourseAccess(req, res, courseId);
    if (!session) return; 
    
    if (req.method === 'GET') {
        try {
            const courseEnrollments = await prisma.enrollment.findMany({
                where: { courseId: courseId },
                select: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        }
                    },
                },
                orderBy: { student: { name: 'asc' } }
            });

            const students = courseEnrollments.map(enrollment => enrollment.student);

            return res.status(200).json({ students });

        } catch (error) {
            console.error("API Error (GET enrolled students):", error);
            return res.status(500).json({ 
                message: 'Failed to fetch enrolled students due to a server error.', 
                details: error.message 
            });
        }
    }

    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}