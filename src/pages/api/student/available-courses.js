import { PrismaClient, UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = global.prisma || new PrismaClient();

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== UserRole.STUDENT) {
        return res.status(403).json({ message: 'Access Denied: Student role required.' });
    }

    if (req.method === 'GET') {
        try {
            // Fetch ALL courses with their assigned lecturers
            const courses = await prisma.course.findMany({
                include: {
                    lecturers: {
                        select: { id: true, name: true },
                    },
                },
                orderBy: { code: 'asc' }
            });
            // Filtering out already enrolled courses is done client-side for simplicity, 
            // but the server should return the full catalog.
            return res.status(200).json({ courses });
        } catch (error) {
            console.error("GET Available Courses Error:", error);
            return res.status(500).json({ message: 'Failed to fetch course catalog.' });
        }
    }
    return res.status(405).json({ message: 'Method Not Allowed' });
}