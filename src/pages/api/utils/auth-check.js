// pages/api/utils/auth-check.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@api/auth/[...nextauth]';
import prisma from '@api/prisma';
import { UserRole } from '@prisma/client';

/**
 * Checks if the user is a LECTURER and is assigned to the given courseId.
 * @param {object} req - Next.js API request object.
 * @param {object} res - Next.js API response object.
 * @param {string} courseId - The ID of the course being accessed.
 * @returns {Promise<object|false>} - The session object if authorized, otherwise false.
 */
export async function checkLecturerCourseAccess(req, res, courseId) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== UserRole.LECTURER) {
        res.status(403).json({ message: 'Forbidden: Lecturer access required.' });
        return false;
    }

    if (!courseId) {
        res.status(400).json({ message: 'Course ID is required.' });
        return false;
    }

    try {
        // Find a course that matches the courseId AND is linked to the lecturer's ID
        const course = await prisma.course.findUnique({
            where: {
                id: courseId,
                lecturers: {
                    some: {
                        id: session.user.id,
                    },
                },
            },
            select: { id: true },
        });

        if (!course) {
            res.status(403).json({ message: 'Forbidden: You are not assigned to manage this course.' });
            return false;
        }

        return session;
    } catch (error) {
        console.error("Authorization check error:", error);
        res.status(500).json({ message: 'Internal server error during authorization.' });
        return false;
    }
}