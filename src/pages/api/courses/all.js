import { PrismaClient, UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]'; // Adjust path as necessary

const prisma = global.prisma || new PrismaClient();

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);

    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    // 1. Authorization Check (Allow STUDENTS and ADMINS to see the catalog)
    if (!session || (session.user.role !== UserRole.STUDENT && session.user.role !== UserRole.ADMIN)) {
        return res.status(403).json({ message: 'Access Denied: Logged-in user required.' });
    }

    try {
        // 2. Fetch ALL Courses
        const allCourses = await prisma.course.findMany({
            select: {
                id: true,
                title: true, // Use 'title' based on your schema fix
                code: true,
                description: true,
                // Include lecturer info if needed for display in the catalog
                lecturers: {
                    select: { name: true },
                    where: { role: UserRole.LECTURER },
                    take: 1,
                },
            },
            orderBy: {
                code: 'asc',
            },
        });

        // 3. Flatten lecturer info for easier use
        const courses = allCourses.map(course => ({
            ...course,
            lecturerName: course.lecturers[0]?.name || 'Staff TBD',
        }));

        // 4. Success Response
        return res.status(200).json({ courses });

    } catch (error) {
        console.error("API Fetch All Courses Database Error:", error);
        return res.status(500).json({ 
            message: 'Failed to fetch the course catalog due to a server error.' 
        });
    }
}