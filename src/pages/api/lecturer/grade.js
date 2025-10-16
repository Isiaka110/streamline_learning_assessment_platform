// pages/api/lecturer/grade.js
import { checkLecturerCourseAccess } from '@api/utils/auth-check';
import prisma from '@api/prisma';

export default async function handler(req, res) {
    // We get courseId from the submission's related assignment
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    
    const { submissionId, gradeValue } = req.body;

    if (!submissionId || gradeValue === undefined || gradeValue === null) {
        return res.status(400).json({ message: 'Missing submission ID or grade value.' });
    }

    try {
        // 1. Find the submission and its parent course for authorization
        const submission = await prisma.submission.findUnique({
            where: { id: submissionId },
            select: { 
                id: true,
                assignment: {
                    select: {
                        courseId: true
                    }
                } 
            }
        });

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found.' });
        }
        
        const courseId = submission.assignment.courseId;
        
        // 2. Authorize the lecturer based on the submission's course
        const session = await checkLecturerCourseAccess(req, res, courseId);
        if (!session) return; // checkLecturerCourseAccess handles the error response

        // 3. Update the submission with the new grade
        const updatedSubmission = await prisma.submission.update({
            where: { id: submissionId },
            data: { 
                grade: parseInt(gradeValue),
                gradedAt: new Date(),
                // Optionally link the grader's ID (the lecturer's ID)
                grader: { connect: { id: session.user.id } }
            },
        });

        return res.status(200).json({ submission: updatedSubmission });

    } catch (error) {
        console.error("API Error (POST grade):", error);
        return res.status(500).json({ message: 'Failed to submit grade.' });
    }
}