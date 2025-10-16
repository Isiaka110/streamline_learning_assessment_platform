import { getServerSession } from 'next-auth/next';
import { authOptions } from '@api/auth/[...nextauth]';
import prisma from '@api/prisma';
import { UserRole } from '@prisma/client';

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Forbidden: Admin access required.' });
    }
    
    // --- POST: Create a new course ---
    if (req.method === 'POST') {
        // FIX: Destructure 'courseCode' from req.body to match frontend payload
        const { courseCode, title, description, semester, year, lecturerIds } = req.body;
        
        if (!courseCode || !title || !semester || !year) {
            return res.status(400).json({ message: 'Missing required course fields (code, title, semester, year).' });
        }

        try {
            const newCourse = await prisma.course.create({
                data: {
                    // FIX: Use 'courseCode' for the Prisma 'code' field
                    code: courseCode, 
                    title,
                    description: description || null,
                    semester,
                    year: parseInt(year), 
                    // Use 'connect' for the many-to-many relationship
                    lecturers: lecturerIds && lecturerIds.length > 0
                        ? {
                            connect: lecturerIds.map(id => ({ id }))
                        }
                        : undefined,
                },
                include: {
                    lecturers: {
                        select: { id: true, name: true, email: true }
                    }
                }
            });
            return res.status(201).json(newCourse);
        } catch (error) {
            console.error("API Error (POST /admin/courses):", error);
            if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
                return res.status(409).json({ message: 'Course with this code already exists.' });
            }
            return res.status(500).json({ 
                message: "Internal server error creating course.", 
                details: error.message 
            });
        }
    }
    
    // --- GET: Fetch all courses with lecturer details (unchanged) ---
    if (req.method === 'GET') {
        try {
            const courses = await prisma.course.findMany({
                include: {
                    lecturers: { 
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    _count: {
                        select: {
                            enrollments: true 
                        }
                    },
                },
                orderBy: {
                    code: "asc"
                }
            });

            const serializableCourses = courses.map(course => ({
                ...course,
                lecturers: course.lecturers.map(lecturer => ({
                    ...lecturer,
                    name: lecturer.name ?? null,
                    email: lecturer.email ?? null,
                })),
            }));

            return res.status(200).json(serializableCourses);

        } catch (error) {
            console.error("API Error (GET /admin/courses):", error);
            return res.status(500).json({ 
                message: "Internal server error fetching courses.", 
                details: error.message 
            });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}

// // pages/api/admin/courses/index.js
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@api/auth/[...nextauth]';
// import prisma from '@api/prisma';
// import { UserRole } from '@prisma/client';



// export default async function handler(req, res) {
//     // 🔑 ADMIN Authorization Check
//     const session = await getServerSession(req, res, authOptions);

//     if (!session || session.user.role !== UserRole.ADMIN) {
//         return res.status(403).json({ message: 'Forbidden: Admin access required.' });
//     }

//     // --- GET: Fetch all courses with lecturer details ---
//     if (req.method === 'GET') {
//         try {
//             const courses = await prisma.course.findMany({
//                 include: {
//                     // ✅ FIX: Use 'lecturers' (plural) for the many-to-many relationship
//                     lecturers: { 
//                         select: {
//                             id: true,
//                             name: true,
//                             email: true
//                         }
//                     },
//                     _count: {
//                         select: {
//                             enrollments: true 
//                         }
//                     },
//                 },
//                 orderBy: {
//                     code: "asc"
//                 }
//             });

//             // Handle null fields for safe serialization
//             const serializableCourses = courses.map(course => ({
//                 ...course,
//                 lecturers: course.lecturers.map(lecturer => ({
//                     ...lecturer,
//                     name: lecturer.name ?? null,
//                     email: lecturer.email ?? null,
//                 })),
//             }));

//             return res.status(200).json(serializableCourses);

//         } catch (error) {
//             console.error("API Error (GET /admin/courses):", error);
//             return res.status(500).json({ 
//                 message: "Internal server error fetching courses.", 
//                 details: error.message 
//             });
//         }
//     }
    
//     // --- POST: Create a new course (Logic for creating courses remains the same) ---
//     if (req.method === 'POST') {
//         const { code, title, description, semester, year, lecturerIds } = req.body;
//         // ... (POST logic to create course and connect to lecturers remains the same as previously provided) ...
        
//         if (!code || !title || !semester || !year) {
//             return res.status(400).json({ message: 'Missing required course fields.' });
//         }

//         try {
//             const newCourse = await prisma.course.create({
//                 data: {
//                     code,
//                     title,
//                     description: description || null,
//                     semester,
//                     year: parseInt(year),
//                     lecturers: lecturerIds && lecturerIds.length > 0
//                         ? {
//                             connect: lecturerIds.map(id => ({ id }))
//                         }
//                         : undefined,
//                 },
//                 include: {
//                     lecturers: {
//                         select: { id: true, name: true, email: true }
//                     }
//                 }
//             });
//             return res.status(201).json(newCourse);
//         } catch (error) {
//             console.error("API Error (POST /admin/courses):", error);
//             if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
//                 return res.status(409).json({ message: 'Course with this code already exists.' });
//             }
//             return res.status(500).json({ 
//                 message: "Internal server error creating course.", 
//                 details: error.message 
//             });
//         }
//     }

//     res.setHeader('Allow', ['GET', 'POST']);
//     return res.status(405).end(`Method ${req.method} Not Allowed`);
// }