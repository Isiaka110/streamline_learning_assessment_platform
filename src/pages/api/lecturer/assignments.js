// File: pages/api/lecturer/assignments.js

import prisma from '@api/prisma'; 
// NOTE: Lecturer Access check function (like checkLecturerCourseAccess) should be imported/defined here

export default async function handler(req, res) {
    // NOTE: Perform authorization and lecturer access check here (omitted for brevity)
    
    const { courseId, id: assignmentId } = req.query;
    
    // --- METHOD HANDLERS ---

    // 1. GET: Fetch all assignments for a course (with counts)
    if (req.method === 'GET') {
        if (!courseId) return res.status(400).json({ message: 'Course ID is required.' });
        try {
            const assignments = await prisma.assignment.findMany({
                where: { courseId: courseId },
                include: {
                    // Fetch all submissions to calculate 'needsGrading'
                    submissions: {
                        select: { id: true, grade: true }
                    },
                    // Fetch total count via aggregation
                    _count: {
                        select: { submissions: true }
                    }
                },
                orderBy: { dueDate: 'desc' }
            });

            // 🔑 FIX: Calculate total submissions and needs grading server-side
            const assignmentsWithCounts = assignments.map(a => ({
                ...a,
                totalSubmissions: a._count.submissions,
                needsGrading: a.submissions.filter(s => s.grade === null).length,
                submissions: undefined, // Remove submission array from final output
                _count: undefined,     // Remove count object from final output
            }));

            return res.status(200).json({ assignments: assignmentsWithCounts });
        } catch (error) {
            console.error("API Error (GET assignments):", error);
            return res.status(500).json({ message: 'Failed to fetch assignments.' });
        }
    }

    // 2. POST: Create a new assignment
    else if (req.method === 'POST') { /* ... (Existing POST logic remains the same) ... */ 
        if (!courseId) return res.status(400).json({ message: 'Course ID is required for creation.' });
        const { title, description, dueDate, maxPoints } = req.body;
        try {
            const newAssignment = await prisma.assignment.create({
                data: { title, description, dueDate, maxPoints, courseId }
            });
            return res.status(201).json({ assignment: newAssignment });
        } catch (error) {
            console.error("API Error (POST assignment):", error);
            return res.status(500).json({ message: 'Failed to create assignment.' });
        }
    }
    
    // 3. PUT: Update an assignment (FIXED for 405)
    else if (req.method === 'PUT') {
        if (!assignmentId || !courseId) {
            return res.status(400).json({ message: 'Assignment ID and Course ID are required for update.' });
        }
        const { title, description, dueDate, maxPoints } = req.body;

        try {
            const updatedAssignment = await prisma.assignment.update({
                where: { id: assignmentId, courseId: courseId },
                data: { title, description, dueDate, maxPoints }
            });
            return res.status(200).json({ assignment: updatedAssignment, message: 'Assignment updated successfully.' });
        } catch (error) {
            console.error("Assignment Update Error:", error);
            if (error.code === 'P2025') {
                 return res.status(404).json({ message: 'Assignment not found.' });
            }
            return res.status(500).json({ message: 'Failed to update assignment.' });
        }
    }

    // 4. DELETE: Delete an assignment (FIXED for 405)
    else if (req.method === 'DELETE') { 
        if (!assignmentId || !courseId) {
            return res.status(400).json({ message: 'Assignment ID and Course ID are required for deletion.' });
        }
        
        try {
            await prisma.assignment.delete({
                where: { id: assignmentId, courseId: courseId }
            });
            // Standard successful DELETE response
            return res.status(204).end(); 

        } catch (error) {
            console.error("Assignment Delete Error:", error);
            if (error.code === 'P2025') {
                 return res.status(404).json({ message: 'Assignment not found or already deleted.' });
            }
            return res.status(500).json({ message: 'Failed to delete assignment due to a server error.' });
        }
    }

    // Default method not allowed response
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}