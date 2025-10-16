// File: pages/api/admin/lecturers.js

import { PrismaClient, UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]'; 
import bcrypt from 'bcryptjs';

// 🔑 PRISMA SINGLETON
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function handler(req, res) {
    
    // 🔑 SECURITY CHECK: Admin role required for all operations
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Access Denied: Admin role required.' });
    }

    // --- READ (R): Fetch all lecturers ---
    if (req.method === 'GET') {
        try {
            const lecturers = await prisma.user.findMany({
                where: { role: UserRole.LECTURER },
                select: { id: true, name: true, email: true, createdAt: true },
                orderBy: { name: 'asc' }
            });
            return res.status(200).json({ lecturers });
        } catch (error) {
            console.error("GET Lecturers Error:", error);
            return res.status(500).json({ message: 'Failed to fetch lecturers.' });
        }
    }

    // ... (Imports and setup remain the same) ...

// --- CREATE (C): Create a new lecturer (Includes fix for optional course assignment) ---
if (req.method === 'POST') {
    // 🔑 NEW: Include optional courseId
    const { name, email, password, courseId } = req.body;
    
    if (!name || !email || !password || password.length < 6) {
        return res.status(400).json({ message: 'Name, valid email, and password (min 6 chars) are required.' });
    }
    
    try {
        // 1. Course Existence Check (If courseId is provided)
        if (courseId) {
             const courseExists = await prisma.course.findUnique({ where: { id: courseId } });
             if (!courseExists) {
                return res.status(404).json({ message: 'The selected course does not exist.' });
             }
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 2. Build dynamic data object for creation
        const creationData = {
            name,
            email,
            password: hashedPassword,
            role: UserRole.LECTURER,
        };

        // 3. Conditionally assign the initial course using 'connect'
        if (courseId) {
            creationData.assignedCourses = {
                connect: { id: courseId }
            };
        }

        const newLecturer = await prisma.user.create({
            data: creationData,
        });
        
        const { password: _, ...lecturerData } = newLecturer; 

        return res.status(201).json({ lecturer: lecturerData });
    } catch (error) {
        console.error('Lecturer Creation Error:', error); 

        if (error.code === 'P2002' && error.meta?.target.includes('email')) {
            return res.status(409).json({ message: 'A user with this email already exists.' });
        }
        
        return res.status(500).json({ message: 'Failed to create new lecturer.' });
    }
}
// ... (Rest of the file) ...
    
    return res.status(405).json({ message: 'Method Not Allowed' });
}