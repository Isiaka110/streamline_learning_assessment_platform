// pages/api/student/assignments.js (CORRECTED)

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
            return res.status(400).json({ message: 'Course ID is required to fetch assignments.' });
        }

        try {
            // 1. Verify student is enrolled in the course
            const enrollment = await prisma.enrollment.findUnique({
                where: {
                    studentId_courseId: {
                        studentId: studentId,
                        courseId: courseId,
                    }
                },
                select: { id: true }
            });

            if (!enrollment) {
                return res.status(403).json({ message: 'Access Denied: You are not enrolled in this course.' });
            }

            // 2. Fetch all assignments for the course, 
            //    and for each assignment, include ONLY the current student's submission (if any).
            const assignments = await prisma.assignment.findMany({
                where: { courseId: courseId },
                include: {
                    submissions: {
                        where: { studentId: studentId }, // CRITICAL: Filter submissions to only THIS student's
                        select: { // Select specific submission fields needed by the frontend
                            id: true,
                            submissionText: true,
                            filePath: true,
                            submittedAt: true,
                            grade: true,
                            feedback: true,
                            gradedAt: true,
                            // createdAt: true, // Include if you have it and need it, based on previous debugging.
                                              // Removed for now to avoid potential re-introduction of error if schema issues persist.
                        }
                    }
                },
                orderBy: { dueDate: 'asc' },
            });

            // The `submissions` array on each assignment will now either contain
            // 1 element (the student's submission) or be empty.
            return res.status(200).json({ assignments });

        } catch (error) {
            console.error("API Get Student Assignments Error:", error);
            return res.status(500).json({ 
                message: 'Failed to fetch assignments due to a server error.',
                errorDetails: error.message,
                errorCode: error.code || 'N/A',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}