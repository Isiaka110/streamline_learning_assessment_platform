import { PrismaClient, UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]'; 
import bcrypt from 'bcryptjs';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function handler(req, res) {
    
    // 🔑 SECURITY CHECK
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Access Denied: Admin role required.' });
    }

    // --- CREATE (C): Create a new lecturer and assign courses ---
    // File: pages/api/admin/register-lecturer.js (Updated POST Handler)

// ... (Imports and setup remain the same) ...

    // --- CREATE (C): Create a new lecturer and assign courses ---
    if (req.method === 'POST') {
        const { name, email, password, courseIds } = req.body; 
        
        // ... (Validation checks remain the same) ...
        if (!name || !email || !password || password.length < 6) {
            return res.status(400).json({ message: 'Name, valid email, and password (min 6 chars) are required.' });
        }
        
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // 🔑 FIX: Prepare the Connect statement correctly. 
            // This assumes a Many-to-Many relation where the join table 
            // links User.id to Course.id.
            const courseConnects = courseIds.map(id => ({ id }));
            
            // ⚠️ CRITICAL: The field name here must match the field defined in your 
            // User model for the M:N relationship to Course (e.g., 'courses', not 'assignedCourses').
            const newLecturer = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: UserRole.LECTURER,
                    
                    // Use 'courses' (or whatever your Prisma field name is)
                    courses: { 
                        connect: courseConnects,
                    },
                },
                include: { courses: { select: { id: true, title: true } } }
            });
            
            // ... (Return logic remains the same) ...
            const { password: _, ...lecturerData } = newLecturer; 
            return res.status(201).json({ lecturer: lecturerData, message: `Lecturer ${name} registered successfully.` });
            
        } catch (error) {
            console.error('Lecturer Registration Error:', error); 

            if (error.code === 'P2002' && error.meta?.target.includes('email')) {
                return res.status(409).json({ message: 'A user with this email already exists.' });
            }
            // P2025/P2003 handles invalid course ID or foreign key issues
            if (error.code === 'P2025' || error.code === 'P2003') {
                return res.status(400).json({ message: 'One or more selected courses are invalid or not found.' });
            }
            
            // ❌ THIS IS THE FALLBACK CATCHING THE UNHANDLED ERROR
            // Return a more generic 500 status here.
            return res.status(500).json({ message: 'Failed to create new lecturer due to an internal server error.' });
        }
    }
    
    // ... (Rest of the file) ...
    
    return res.status(405).json({ message: 'Method Not Allowed' });
}