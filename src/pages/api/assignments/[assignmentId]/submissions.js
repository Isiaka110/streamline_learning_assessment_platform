import prisma from '@api/prisma'; 
import { checkLecturerCourseAccess } from '@api/utils/auth-check'; 

export default async function handler(req, res) {
    const { assignmentId } = req.query;

    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    if (!assignmentId) {
        return res.status(400).json({ message: 'Assignment ID is required.' });
    }

    try {
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            select: { id: true, courseId: true, maxPoints: true } 
        });

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found.' });
        }

        // 🔑 SECURE: Check if user is a LECTURER and teaches the course for this assignment
        const session = await checkLecturerCourseAccess(req, res, assignment.courseId);
        if (!session) return; 

        const submissions = await prisma.submission.findMany({
            where: { assignmentId: assignmentId },
            select: { // 🔑 FIX: Ensure 'filePath' is selected
                id: true,
                submissionText: true,
                filePath: true, 
                submittedAt: true,
                grade: true,
                feedback: true,
                gradedAt: true,
                student: { select: { id: true, name: true, email: true } }
            }
        });

        return res.status(200).json({ 
            submissions, 
            maxPoints: assignment.maxPoints 
        });

    } catch (error) {
        console.error("Submission Fetch API Error:", error);
        return res.status(500).json({ 
            message: 'Internal Server Error fetching submissions.', 
            details: error.message 
        });
    }
}