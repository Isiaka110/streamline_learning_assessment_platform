// pages/api/lecturer/submissions.js (NEW FILE)

import prisma from '@api/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@api/auth/[...nextauth]';
import { UserRole } from '@prisma/client';


export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== UserRole.LECTURER) {
        return res.status(403).json({ message: 'Access Denied: Lecturer role required.' });
    }

    const lecturerId = session.user.id;
    const { assignmentId } = req.query;

    if (req.method === 'GET') {
        if (!assignmentId) {
            return res.status(400).json({ message: 'Assignment ID is required.' });
        }

        try {
            // Verify the lecturer teaches the course associated with this assignment
            const assignmentCheck = await prisma.assignment.findUnique({
                where: { id: assignmentId },
                select: {
                    course: {
                        select: {
                            lecturers: {
                                where: { id: lecturerId },
                                select: { id: true }
                            }
                        }
                    }
                }
            });

            if (!assignmentCheck || assignmentCheck.course.lecturers.length === 0) {
                return res.status(403).json({ message: 'Access Denied: You are not authorized to view submissions for this assignment.' });
            }

            const submissions = await prisma.submission.findMany({
                where: { assignmentId: assignmentId },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: { submittedAt: 'asc' },
            });

            return res.status(200).json({ submissions });

        } catch (error) {
            console.error("API Get Lecturer Submissions Error:", error);
            return res.status(500).json({ message: 'Failed to fetch submissions due to a server error.' });
        }
    }

    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}