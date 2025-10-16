import { PrismaClient, UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]'; 

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function handler(req, res) {
    
    // 🔑 SECURITY CHECK
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Access Denied: Admin role required.' });
    }

    // --- READ (R): Fetch all courses ---
    if (req.method === 'GET') {
        try {
            const courses = await prisma.course.findMany({
                // Select only necessary fields for the dropdown
                select: { 
                    id: true, 
                    title: true, 
                    code: true, 
                },
                orderBy: { code: 'asc' }
            });
            return res.status(200).json({ courses });
        } catch (error) {
            console.error("GET All Courses Error:", error);
            return res.status(500).json({ message: 'Failed to fetch all courses.' });
        }
    }
    
    return res.status(405).json({ message: 'Method Not Allowed' });
}