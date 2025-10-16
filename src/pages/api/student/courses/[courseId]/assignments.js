// pages/api/student/courses/[courseId]/assignments.js

import { PrismaClient, UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@api/auth/[...nextauth]';

const prisma = global.prisma || new PrismaClient();

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);

    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    if (!session || session.user.role !== UserRole.STUDENT) {
        return res.status(403).json({ message: 'Access Denied: Student role required.' });
    }

    const studentId = session.user.id;
    const { courseId } = req.query; 

    if (!courseId) {
        return res.status(400).json({ message: 'Missing course ID.' });
    }

    try {
        const assignments = await prisma.assignment.findMany({
            where: {
                courseId: courseId,
            },
            select: {
                id: true,
                title: true,
                description: true,
                dueDate: true,
                maxPoints: true, 

                submissions: {
                    where: {
                        studentId: studentId,
                    },
                    select: {
                        id: true,
                        grade: true,
                        // ❌ REMOVED: submissionText (This caused the Prisma error)
                        submittedAt: true,
                    },
                    take: 1, 
                },
            },
            orderBy: {
                dueDate: 'asc',
            }
        });

        // Clean up the data structure for the frontend.
        const assignmentsWithGrades = assignments.map(assignment => ({
            id: assignment.id,
            title: assignment.title,
            description: assignment.description,
            dueDate: assignment.dueDate,
            maxPoints: assignment.maxPoints,
            
            // Flatten the submission details.
            submission: assignment.submissions.length > 0 ? {
                id: assignment.submissions[0].id,
                grade: assignment.submissions[0].grade,
                submittedAt: assignment.submissions[0].submittedAt,
            } : null,
        }));

        return res.status(200).json({ assignments: assignmentsWithGrades });

    } catch (error) {
        console.error("API Fetch Assignments Error:", error);
        
        if (error.code === 'P2025') {
             return res.status(404).json({ message: 'Course or related data not found.' });
        }
        
        return res.status(500).json({ 
            message: 'Failed to fetch assignments due to an internal server error. Check server logs.' 
        });
    }
}