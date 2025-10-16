// pages/api/lecturer/assignments/[assignmentId].js
import { checkLecturerCourseAccess } from '@api/utils/auth-check'; // Adjust path
import prisma from '@api/prisma'; // Adjust path

export default async function handler(req, res) {
    const { assignmentId } = req.query; // Get assignmentId from dynamic route
    const { courseId } = req.query;     // Get courseId from query parameter

    const session = await checkLecturerCourseAccess(req, res, courseId);
    if (!session) return;

    // --- GET (for fetching single assignment for editing) ---
    if (req.method === 'GET') {
        try {
            const assignment = await prisma.assignment.findUnique({
                where: { id: assignmentId, courseId: courseId },
            });
            if (!assignment) {
                return res.status(404).json({ message: 'Assignment not found or unauthorized.' });
            }
            return res.status(200).json({ assignment });
        } catch (error) {
            console.error("API Error (GET single assignment):", error);
            return res.status(500).json({ message: 'Failed to load assignment.' });
        }
    }

    // --- PUT (for updating an assignment) ---
    if (req.method === 'PUT') {
        const { title, description, dueDate, maxPoints } = req.body;

        if (!title || !dueDate || !maxPoints) {
            return res.status(400).json({ message: 'Missing required assignment fields for update.' });
        }

        try {
            const updatedAssignment = await prisma.assignment.update({
                where: { id: assignmentId, courseId: courseId }, // Ensure lecturer owns/teaches the course
                data: {
                    title,
                    description,
                    dueDate: new Date(dueDate),
                    maxPoints: parseInt(maxPoints),
                },
            });
            return res.status(200).json({ assignment: updatedAssignment });
        } catch (error) {
            console.error("API Error (PUT assignment):", error);
            return res.status(500).json({ message: 'Failed to update assignment.' });
        }
    }

    // ... (optional DELETE method here) ...

    res.setHeader('Allow', ['GET', 'PUT']); // Add DELETE if implemented
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}