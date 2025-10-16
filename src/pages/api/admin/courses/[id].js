import { getServerSession } from 'next-auth/next';
import { authOptions } from '@api/auth/[...nextauth]';
import prisma from '@api/prisma';
import { UserRole } from '@prisma/client';

export default async function handler(req, res) {
    // CRITICAL: Get ID from the URL query
    const { id } = req.query; 

    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Forbidden: Admin access required.' });
    }
    
    if (!id) {
        return res.status(400).json({ message: 'Missing course ID in request URL.' }); 
    }
    
    // --- PUT: Update a course ---
    if (req.method === 'PUT') {
        const { courseCode, title, description, semester, year, lecturerIds } = req.body; 

        // Validate required fields (even though code is not updated, they must be present)
        if (!title || !semester || !year) {
            return res.status(400).json({ message: 'Missing required course fields (title, semester, year).' });
        }

        try {
            const connectLecturers = lecturerIds?.map(lecturerId => ({ id: lecturerId })) || [];
            
            const updatedCourse = await prisma.course.update({
                where: { id: id },
                data: {
                    title,
                    description: description || null,
                    semester,
                    year: parseInt(year),
                    lecturers: {
                        // Use 'set' to replace the list of lecturers entirely
                        set: connectLecturers, 
                    },
                },
                include: {
                    lecturers: { select: { id: true, name: true, email: true } }
                }
            });
            return res.status(200).json(updatedCourse);

        } catch (error) {
            console.error(`API Error (PUT /admin/courses/${id}):`, error);
            return res.status(500).json({ 
                message: "Internal server error updating course.", 
                details: error.message 
            });
        }
    }
    
    // --- DELETE: Delete a course ---
    if (req.method === 'DELETE') {
        try {
            await prisma.course.delete({
                where: { id: id },
            });
            return res.status(200).json({ message: `Course ID ${id} successfully deleted.` });
        } catch (error) {
            console.error(`API Error (DELETE /admin/courses/${id}):`, error);
            if (error.code === 'P2025') {
                 return res.status(404).json({ message: `Course ID ${id} not found.` });
            }
            return res.status(500).json({ message: "Internal server error deleting course." });
        }
    }

    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}
// // pages/api/admin/courses/[courseId].js
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@api/auth/[...nextauth]';
// import prisma from '@api/prisma';
// import { UserRole } from '@prisma/client';



// export default async function handler(req, res) {
//     const session = await getServerSession(req, res, authOptions);
//     const { courseId } = req.query; 

//     // Admin Authorization Check
//     if (!session || session.user.role !== UserRole.ADMIN) {
//         return res.status(403).json({ message: 'Forbidden: Admin access required.' });
//     }

//     if (!courseId) {
//         return res.status(400).json({ message: 'Missing course ID.' });
//     }

//     // ----------------------------------------------------------------------
//     // --- GET: Fetch Single Course for Editing ---
//     // ----------------------------------------------------------------------
//     if (req.method === 'GET') {
//         try {
//             const course = await prisma.course.findUnique({
//                 where: { id: courseId },
//                 include: { 
//                     // 🔑 Use 'lecturers' (assuming Course model uses this field for relationship)
//                     lecturers: { 
//                         select: { id: true, name: true, email: true } 
//                     } 
//                 }
//             });

//             if (!course) {
//                 return res.status(404).json({ message: 'Course not found.' });
//             }

//             return res.status(200).json(course);
//         } catch (error) {
//             console.error(`API Error (GET /admin/courses/${courseId}):`, error);
//             return res.status(500).json({ message: 'Internal server error fetching course details.' });
//         }
//     } 
    
//     // ----------------------------------------------------------------------
//     // --- PUT: Update Course Details and Lecturers ---
//     // ----------------------------------------------------------------------
//     else if (req.method === 'PUT') {
//         const { code, title, description, semester, year, lecturerIds } = req.body;
        
//         // Validation
//         if (!code || !title || !semester || !year || !Array.isArray(lecturerIds)) {
//             return res.status(400).json({ message: 'Missing required fields (code, title, semester, year, or lecturerIds array).' });
//         }
        
//         const lecturerIdsToConnect = lecturerIds.map(id => ({ id }));

//         try {
//             // Find current lecturers to calculate disconnect list
//             const currentCourse = await prisma.course.findUnique({
//                 where: { id: courseId },
//                 select: { lecturers: { select: { id: true } } }
//             });

//             if (!currentCourse) {
//                 return res.status(404).json({ message: 'Course not found for update.' });
//             }

//             // Lecturers to disconnect: those currently assigned that are NOT in the new list
//             const lecturersToDisconnect = currentCourse.lecturers
//                 .filter(lecturer => !lecturerIds.includes(lecturer.id))
//                 .map(lecturer => ({ id: lecturer.id }));

//             // Lecturers to connect: those in the new list that were NOT currently assigned
//             // NOTE: Prisma's 'connect' handles existing connections gracefully, 
//             // but explicitly setting disconnect/connect ensures a clean update.
//             const lecturersToConnect = lecturerIds.map(id => ({ id }));
            
            
//             const updatedCourse = await prisma.course.update({
//                 where: { id: courseId },
//                 data: { 
//                     code: code.trim(), 
//                     title: title.trim(), 
//                     description: description?.trim() || null, 
//                     semester, 
//                     year: parseInt(year),
//                     lecturers: {
//                         disconnect: lecturersToDisconnect,
//                         connect: lecturersToConnect,
//                     }, 
//                 },
//                 include: { lecturers: { select: { id: true, name: true, email: true } } }
//             });
            
//             return res.status(200).json(updatedCourse);
//         } catch (error) {
//             console.error(`API Error (PUT /admin/courses/${courseId}):`, error);
//             if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
//                 return res.status(409).json({ message: 'A course with this code already exists.' });
//             }
//             if (error.code === 'P2025') {
//                 return res.status(404).json({ message: 'Course not found or one of the lecturers does not exist.' });
//             }
//             return res.status(500).json({ message: 'Internal server error updating course.', error: error.message });
//         }
//     } 
    
//     // ----------------------------------------------------------------------
//     // --- DELETE: Delete Course ---
//     // ----------------------------------------------------------------------
//     else if (req.method === 'DELETE') {
//         try {
//             await prisma.course.delete({ where: { id: courseId } });
//             return res.status(200).json({ message: 'Course deleted successfully.' }); // Changed to 200/JSON for easier client handling
//         } catch (error) {
//             console.error(`API Error (DELETE /admin/courses/${courseId}):`, error);
//             if (error.code === 'P2025') {
//                 return res.status(404).json({ message: 'Course not found or already deleted.' });
//             }
//             // Add P2003 handler if your schema has onDelete: RESTRICT/SET NULL on related models
//             return res.status(500).json({ message: 'Internal server error deleting course.' });
//         }
//     }

//     res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
//     return res.status(405).end(`Method ${req.method} Not Allowed`);
// }

// // export default async function handler(req, res) {
// //     const session = await getServerSession(req, res, authOptions);
// //     const { courseId } = req.query; // 🔑 Correctly retrieve ID from query

// //     // Admin Authorization Check
// //     if (!session || session.user.role !== UserRole.ADMIN) {
// //         return res.status(403).json({ message: 'Forbidden: Admin access required.' });
// //     }

// //     if (!courseId) {
// //         return res.status(400).json({ message: 'Missing course ID.' });
// //     }

// //     // --- GET, PUT, DELETE methods (logic is confirmed correct) ---
// //     if (req.method === 'GET') {
// //         // ... (GET logic is confirmed) ...
// //     } else if (req.method === 'PUT') {
// //         // ... (PUT logic is confirmed with lecturer updates) ...
// //         const { code, title, description, semester, year, lecturerIds } = req.body;
// //         // ... (validation) ...
// //         try {
// //             // ... (diff calculation) ...
// //             const updatedCourse = await prisma.course.update({
// //                 where: { id: courseId },
// //                 data: { 
// //                     code, title, description: description || null, semester, year: parseInt(year),
// //                     lecturers: { disconnect: [...], connect: [...] }, // Course to Lecturer M:M
// //                 },
// //                 include: { lecturers: { select: { id: true, name: true, email: true } } }
// //             });
// //             return res.status(200).json(updatedCourse);
// //         } catch (error) {
// //             // ... (error handling) ...
// //         }
// //     } else if (req.method === 'DELETE') {
// //         // ... (DELETE logic is confirmed) ...
// //         try {
// //             await prisma.course.delete({ where: { id: courseId } });
// //             return res.status(204).end(); 
// //         } catch (error) {
// //              // ... (error handling) ...
// //         }
// //     }

// //     res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
// //     return res.status(405).end(`Method ${req.method} Not Allowed`);
// // }