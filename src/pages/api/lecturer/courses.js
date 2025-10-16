// pages/api/lecturer/courses.js

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@api/auth/[...nextauth]'; // Adjust path
import prisma from '@api/prisma'; // Adjust path
import { UserRole } from '@prisma/client'; 

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);

    // 1. Authorization Check
    if (!session || session.user.role !== UserRole.LECTURER) {
        return res.status(403).json({ message: 'Forbidden: Lecturer access required.' });
    }

    if (req.method === 'GET') {
        try {
            // 2. Fetch the Lecturer's courses using the session user ID
            const lecturerWithCourses = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: {
                    // Assuming 'taughtCourses' is the relation field name in your Prisma schema
                    taughtCourses: {
                        select: {
                            id: true,
                            title: true,
                            code: true,
                            // Add any other necessary course fields
                        },
                    },
                },
            });

            if (!lecturerWithCourses) {
                return res.status(404).json({ message: 'Lecturer record not found.' });
            }

            // 3. Return the array of courses
            // The frontend expects the array under the key 'courses'
            return res.status(200).json({ courses: lecturerWithCourses.taughtCourses });

        } catch (error) {
            console.error("API Error fetching lecturer courses:", error);
            return res.status(500).json({ message: 'Internal server error fetching courses.' });
        }
    }

    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}


// import { PrismaClient, UserRole } from '@prisma/client';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../auth/[...nextauth]';

// const prisma = global.prisma || new PrismaClient();

// export default async function handler(req, res) {
//     const session = await getServerSession(req, res, authOptions);

//     // 1. Authorization Check: Only Lecturers can access
//     if (!session || session.user.role !== UserRole.LECTURER) {
//         return res.status(403).json({ message: 'Access Denied: Lecturer role required.' });
//     }

//     if (req.method === 'GET') {
//         try {
//             const lecturerId = session.user.id;

//             // 2. Fetch all courses where this user is listed as a lecturer
//             const assignedCourses = await prisma.course.findMany({
//                 where: {
//                     lecturers: {
//                         some: {
//                             id: lecturerId,
//                         },
//                     },
//                 },
//                 select: {
//                     id: true,
//                     code: true,
//                     title: true,
//                     description: true,
//                     // Add any other fields the dashboard needs
//                 },
//                 orderBy: { code: 'asc' }
//             });

//             return res.status(200).json({ courses: assignedCourses });

//         } catch (error) {
//             console.error("GET Lecturer Courses Error:", error);
//             return res.status(500).json({ message: 'Failed to fetch assigned courses.' });
//         }
//     }

//     res.setHeader('Allow', ['GET']); 
//     return res.status(405).end(`Method ${req.method} Not Allowed`);
// }
