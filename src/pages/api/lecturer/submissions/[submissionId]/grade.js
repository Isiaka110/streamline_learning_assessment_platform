// pages/api/lecturer/submissions/[submissionId]/grade.js

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
    const { submissionId } = req.query;

    if (req.method === 'PUT') {
        const { grade, feedback } = req.body;

        // Input validation
        if (grade !== null && (typeof grade !== 'number' || isNaN(grade) || grade < 0)) {
            return res.status(400).json({ message: 'Grade must be a non-negative number or null.' });
        }
        if (feedback !== null && typeof feedback !== 'string') {
            return res.status(400).json({ message: 'Feedback must be a string or null.' });
        }

        try {
            // 1. Find the submission
            const submission = await prisma.submission.findUnique({
                where: { id: submissionId },
                select: { assignment: { select: { course: { select: { lecturerId: true } } } } }
            });

            if (!submission) {
                return res.status(404).json({ message: 'Submission not found.' });
            }

            // 2. Verify lecturer is assigned to the course of this assignment
            if (submission.assignment.course.lecturerId !== lecturerId) {
                return res.status(403).json({ message: 'Access Denied: You are not assigned to this course.' });
            }

            // 3. Update the submission
            const updatedSubmission = await prisma.submission.update({
                where: { id: submissionId },
                data: {
                    grade: grade,
                    feedback: feedback,
                    gradedAt: (grade !== null || feedback !== null) ? new Date() : null, // Set gradedAt if graded/feedback given
                },
                select: { // Select only necessary fields for response
                    id: true,
                    grade: true,
                    feedback: true,
                    gradedAt: true,
                    submittedAt: true,
                }
            });

            return res.status(200).json({ message: 'Submission graded successfully!', submission: updatedSubmission });

        } catch (error) {
            console.error("API Update Submission Grade Error:", error);
            return res.status(500).json({ 
                message: 'Failed to update submission grade due to a server error.',
                errorDetails: error.message,
                errorCode: error.code || 'N/A',
            });
        }
    }

    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}