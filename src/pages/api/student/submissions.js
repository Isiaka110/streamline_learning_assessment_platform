// pages/api/student/submissions.js (Verify this file)

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

    if (req.method === 'POST') {
        const { assignmentId, submissionText, filePath } = req.body;

        if (!assignmentId) {
            return res.status(400).json({ message: 'Assignment ID is required.' });
        }
        
        // Ensure at least one form of content is provided
        if (!submissionText && !filePath) {
             return res.status(400).json({ message: 'Submission must contain either text or a file.' });
        }

        try {
            // 1. Find the Assignment to get the Course ID
            const assignment = await prisma.assignment.findUnique({
                where: { id: assignmentId },
                select: { courseId: true }
            });

            if (!assignment) {
                return res.status(404).json({ message: 'Assignment not found.' });
            }

            // 2. VERIFY STUDENT ENROLLMENT (using the unique compound key)
            const enrollment = await prisma.enrollment.findUnique({
                where: {
                    studentId_courseId: {
                        studentId: studentId,
                        courseId: assignment.courseId,
                    }
                },
                select: { id: true }
            });

            if (!enrollment) {
                return res.status(403).json({ message: 'Access Denied: You are not enrolled in the course for this assignment.' });
            }

            // 3. Check for existing submission using the compound unique key
            const existingSubmission = await prisma.submission.findUnique({
                where: {
                    assignmentId_studentId: { 
                        assignmentId: assignmentId,
                        studentId: studentId
                    }
                },
                // Crucially, select `id` to determine if it exists,
                // and `createdAt` if we want to log it later, but not strictly needed for logic
                select: { id: true }
            });

            let submission;
            let statusCode;
            let message;

            const baseSubmissionData = {
                submissionText: submissionText || null, 
                filePath: filePath || null,             
                submittedAt: new Date(), // Always update submission time on action             
            };

            if (existingSubmission) {
                // Update an existing submission (Resubmission)
                submission = await prisma.submission.update({
                    where: { id: existingSubmission.id },
                    data: {
                        ...baseSubmissionData,
                        grade: null,    // Reset grade on resubmission
                        gradedAt: null, // Reset gradedAt
                        feedback: null, // Reset feedback
                    },
                    // CRITICAL FIX: Explicitly select all necessary fields for the response,
                    // including createdAt and submittedAt, so they are always Date objects
                    select: {
                        id: true,
                        assignmentId: true,
                        studentId: true,
                        submissionText: true,
                        filePath: true,
                        submittedAt: true,
                        createdAt: true, 
                        grade: true,
                        feedback: true,
                        gradedAt: true,
                    }
                });
                statusCode = 200; // OK
                message = 'Submission updated successfully!';
            } else {
                // Create a new submission
                submission = await prisma.submission.create({
                    data: {
                        ...baseSubmissionData,
                        assignmentId: assignmentId,
                        studentId: studentId,
                    },
                    // CRITICAL FIX: Explicitly select all necessary fields for the response
                    select: {
                        id: true,
                        assignmentId: true,
                        studentId: true,
                        submissionText: true,
                        filePath: true,
                        submittedAt: true,
                        createdAt: true, 
                        grade: true,
                        feedback: true,
                        gradedAt: true,
                    }
                });
                statusCode = 201; // Created
                message = 'Assignment submitted successfully!';
            }

            return res.status(statusCode).json({ message, submission });

        } catch (error) {
            console.error("API Create/Update Student Submission Error:", error);
            // Provide more specific error details in the response for debugging
            return res.status(500).json({ 
                message: `Failed to submit assignment due to a server error.`,
                errorDetails: error.message,
                errorCode: error.code || 'N/A', // Prisma error code (e.g., P2002 for unique constraint)
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined // Include stack in dev
            });
        }
    }

    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}