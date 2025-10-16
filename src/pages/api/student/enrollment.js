import { PrismaClient, UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]'; // Adjust path as necessary

const prisma = global.prisma || new PrismaClient();

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    // 1. Authorization Check
    if (!session || session.user.role !== UserRole.STUDENT) {
        return res.status(403).json({ message: 'Access Denied: Student role required.' });
    }

    const studentId = session.user.id;
    const { courseId } = req.body;

    if (!courseId) {
        return res.status(400).json({ message: 'Missing required field: courseId.' });
    }

    try {
        // 2. Check for existing enrollment to prevent duplicates
        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                studentId_courseId: { // This relies on the @@unique([studentId, courseId]) defined in your schema
                    studentId: studentId,
                    courseId: courseId,
                },
            },
        });

        if (existingEnrollment) {
            return res.status(409).json({ message: 'You are already enrolled in this course.' });
        }

        // 3. Create the new Enrollment record
        const newEnrollment = await prisma.enrollment.create({
            data: {
                studentId: studentId,
                courseId: courseId,
            },
        });

        // 4. Success Response
        return res.status(201).json({ 
            message: 'Enrollment successful.', 
            enrollment: newEnrollment 
        });

    } catch (error) {
        console.error("API Enrollment Error:", error);

        // Handle specific Prisma error codes (like P2003 for invalid courseId)
        if (error.code === 'P2003') {
             return res.status(400).json({ message: 'Course ID is invalid or does not exist.' });
        }
        
        // Generic server error
        return res.status(500).json({ 
            message: 'Failed to complete enrollment due to a server error.' 
        });
    }
}