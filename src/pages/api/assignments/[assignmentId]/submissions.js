// File: pages/api/assignments/[assignmentId]/submissions.js

import prisma from '@api/prisma'; 
// NOTE: Access control check needed here!

export default async function handler(req, res) {
    // NOTE: A lecturer authorization check should be performed here
    
    const { assignmentId } = req.query;

    if (req.method === 'GET') {
        if (!assignmentId) {
            return res.status(400).json({ message: 'Assignment ID is required.' });
        }
        
        try {
            const assignment = await prisma.assignment.findUnique({
                where: { id: assignmentId },
                select: { maxPoints: true, courseId: true } // Need courseId for auth check if implemented
            });

            if (!assignment) {
                return res.status(404).json({ message: 'Assignment not found.' });
            }

            // (NOTE: Insert Lecturer course access check using assignment.courseId here)

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

    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}