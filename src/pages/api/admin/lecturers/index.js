// File: pages/api/admin/lecturers/index.js (UPDATED - Simplified GET and Corrected Relationship)

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@api/auth/[...nextauth]'; // Adjust path as needed
import prisma from '@api/prisma'; // Adjust path as needed
import { UserRole } from '@prisma/client'; 
import { hash } from 'bcryptjs'; 


export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== UserRole.ADMIN) {
        console.warn(`Attempted unauthorized access to /api/admin/lecturers by user: ${session?.user?.email || 'Unknown'}`);
        return res.status(403).json({ message: 'Forbidden: Admin access required.' });
    }

    // --- GET: Fetch all lecturers ---
    if (req.method === 'GET') {
        try {
            const lecturers = await prisma.user.findMany({
                where: {
                    role: UserRole.LECTURER,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    
                    // 🔑 CRITICAL FIX: Changed 'courses' to 'taughtCourses' 
                    // to match the field name in your Prisma schema.
                    taughtCourses: { 
                        select: {
                            id: true,
                            title: true,
                            code: true,
                        },
                    },
                },
                orderBy: {
                    name: 'asc',
                },
            });

            // Ensure null names/emails are handled for serialization safety
            const serializableLecturers = lecturers.map(l => ({
                ...l,
                name: l.name ?? 'N/A', 
                email: l.email ?? 'N/A',
                // Rename taughtCourses back to 'courses' for client-side compatibility 
                // if the client component expects 'courses'. 
                // If the client component expects 'taughtCourses', remove this line.
                courses: l.taughtCourses, 
                // We'll keep the client logic expecting 'courses' as a convention
                // but you may need to check your AdminLecturerTable.js
            }));

            // Sending back 'serializableLecturers' which has the courses under the 'courses' key (if renamed above)
            // or the original 'lecturers' which has the courses under the 'taughtCourses' key.
            // Based on the prior component code, the client expects 'courses'.
            return res.status(200).json(serializableLecturers.map(l => {
                const { taughtCourses, ...rest } = l;
                return { ...rest, courses: taughtCourses };
            }));

        } catch (error) {
            console.error('API Error (GET /admin/lecturers):', error);
            return res.status(500).json({ 
                message: 'Internal server error fetching lecturers.', 
                error: error.message 
            });
        }
    }

    // ----------------------------------------------------------------------
    // --- POST: Create a new lecturer account ---
    // ----------------------------------------------------------------------
    if (req.method === 'POST') {
        const { name, email, password, courseIds } = req.body; 

        if (!name || name.trim().length < 2) {
            return res.status(400).json({ message: 'Valid name is required (min 2 characters).' });
        }
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ message: 'Valid email address is required.' });
        }
        if (!password || password.length < 6) { 
            return res.status(400).json({ message: 'Password is required and must be at least 6 characters long.' });
        }

        try {
            const existingUser = await prisma.user.findUnique({
                where: { email },
                select: { id: true },
            });

            if (existingUser) {
                return res.status(409).json({ message: 'A user with this email already exists.' });
            }

            const hashedPassword = await hash(password, 10);

            const newLecturer = await prisma.user.create({
                data: {
                    name: name.trim(),
                    email: email.toLowerCase(),
                    password: hashedPassword,
                    role: UserRole.LECTURER,
                    // 🔑 CRITICAL FIX: Use 'taughtCourses' for the relationship connect
                    taughtCourses: { 
                        connect: courseIds?.map(id => ({ id })) || [], 
                    },
                },
                select: {
                    id: true, 
                    name: true, 
                    email: true, 
                    role: true, 
                    createdAt: true, 
                    // 🔑 CRITICAL FIX: Use 'taughtCourses' in the select
                    taughtCourses: { 
                        select: { id: true, title: true, code: true },
                    },
                },
            });

            // Format POST response to match GET response structure (using 'courses' key)
            const { taughtCourses, ...rest } = newLecturer;
            const formattedLecturer = { ...rest, courses: taughtCourses };


            return res.status(201).json({ message: 'Lecturer created successfully.', lecturer: formattedLecturer });
        } catch (error) {
            console.error('API Error (POST /admin/lecturers):', error);
            if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
                return res.status(409).json({ message: 'A user with this email already exists (database conflict).' });
            }
            return res.status(500).json({ 
                message: 'Internal server error creating lecturer.', 
                error: error.message 
            });
        }
    }
    
    res.setHeader('Allow', ['GET', 'POST']); 
    return res.status(405).json({ message: `Method ${req.method} Not Allowed. Only GET and POST are supported on this route.` });
}