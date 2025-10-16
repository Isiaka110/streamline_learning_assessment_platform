// pages/api/admin/lecturers/[lecturerId].js

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@api/auth/[...nextauth]'; // Adjust path
import prisma from '@api/prisma';
import { UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);
    const { lecturerId } = req.query;

    // 1. Authorization Check (Admin only)
    if (!session || session.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Forbidden: Admin access required.' });
    }

    if (!lecturerId) {
        return res.status(400).json({ message: 'Missing lecturer ID.' });
    }

    // ----------------------------------------------------------------------
    // --- PUT: Update Existing Lecturer ---
    // ----------------------------------------------------------------------
    if (req.method === 'PUT') {
        // Expected payload from client: { name, email, newPassword (optional), newCourseIds: string[] }
        const { name, email, newPassword, newCourseIds } = req.body;
        const updateData = {};
        
        // 1. CRITICAL VALIDATION: Check for required fields and array type
        if (!name || !email || newCourseIds === undefined || !Array.isArray(newCourseIds)) {
            return res.status(400).json({ 
                message: 'Missing or invalid required fields (name, email, or newCourseIds array).' 
            });
        }

        // Prepare simple field updates
        updateData.name = name.trim();
        updateData.email = email.toLowerCase();

        // Prepare password update if provided
        if (newPassword) {
            if (newPassword.length < 6) {
                return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
            }
            updateData.password = await hash(newPassword, 10);
        }

        // Prepare course connections array in Prisma format
        const courseIdsToConnect = newCourseIds.map(id => ({ id }));

        try {
            // 2. Perform the Update Transaction (Atomicity ensures data integrity)
            const updatedLecturer = await prisma.$transaction(async (tx) => {
                
                // a) Disconnect all existing courses (safest way to replace all connections)
                await tx.user.update({
                    where: { id: lecturerId },
                    data: {
                        // 🔑 CRITICAL: Use the correct relationship name 'taughtCourses'
                        taughtCourses: { set: [] } 
                    }
                });

                // b) Update lecturer details and connect new courses
                const lecturer = await tx.user.update({
                    where: { id: lecturerId },
                    data: {
                        ...updateData, // Apply name, email, password updates
                        // 🔑 CRITICAL: Use the correct relationship name 'taughtCourses'
                        taughtCourses: { connect: courseIdsToConnect },
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        // Select the updated courses using the correct field name
                        taughtCourses: { select: { id: true, code: true, title: true } }
                    }
                });

                return lecturer;
            });
            
            // 3. Format response for client consistency (using 'courses' key)
            const { taughtCourses, ...rest } = updatedLecturer;
            const formattedLecturer = { ...rest, courses: taughtCourses };

            return res.status(200).json({ 
                message: 'Lecturer updated successfully.', 
                lecturer: formattedLecturer
            });

        } catch (error) {
            console.error(`API Error (PUT /admin/lecturers/${lecturerId}):`, error);

            if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
                return res.status(409).json({ message: 'Email already exists for another user.' });
            }
            if (error.code === 'P2025') {
                 // P2025: Record not found (either the lecturer or one of the course IDs)
                return res.status(404).json({ message: 'Lecturer not found or one of the assigned courses does not exist.' });
            }
            
            // 🚨 General Internal Server Error (500)
            return res.status(500).json({ 
                message: 'Internal server error updating lecturer.', 
                // Return the error message in development/debugging to help client fix
                error: error.message 
            });
        }
    }

    // ----------------------------------------------------------------------
    // --- DELETE: Delete Lecturer ---
    // ----------------------------------------------------------------------
    if (req.method === 'DELETE') {
        try {
            await prisma.user.delete({
                // Ensure only LECTURERs can be deleted via this route
                where: { id: lecturerId, role: UserRole.LECTURER }, 
            });
            return res.status(200).json({ message: 'Lecturer deleted successfully.' });
        } catch (error) {
            console.error(`API Error (DELETE /admin/lecturers/${lecturerId}):`, error);
            if (error.code === 'P2025') {
                return res.status(404).json({ message: 'Lecturer not found or already deleted.' });
            }
            return res.status(500).json({ message: 'Internal server error deleting lecturer.' });
        }
    }

    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}

// export default async function handler(req, res) {
//     const session = await getServerSession(req, res, authOptions);
//     const { lecturerId } = req.query;

//     // 1. ADMIN Authorization Check
//     if (!session || session.user.role !== UserRole.ADMIN) {
//         return res.status(403).json({ message: 'Forbidden: Admin access required.' });
//     }

//     if (!lecturerId) {
//         return res.status(400).json({ message: 'Lecturer ID is required.' });
//     }

//     // --- GET: Fetch a single lecturer's details ---
//     if (req.method === 'GET') {
//         try {
//             const lecturer = await prisma.user.findUnique({
//                 where: { id: lecturerId, role: UserRole.LECTURER },
//                 include: {
//                     courses: { 
//                         select: { id: true, code: true, title: true } 
//                     }
//                 },
//             });

//             if (!lecturer) { return res.status(404).json({ message: 'Lecturer not found.' }); }
            
//             const { passwordHash, ...serializableLecturer } = lecturer;
//             // Ensure null fields for serialization safety
//             serializableLecturer.name = serializableLecturer.name ?? null;
//             serializableLecturer.email = serializableLecturer.email ?? null;

//             return res.status(200).json(serializableLecturer);
//         } catch (error) {
//             console.error("API Error (GET lecturer details):", error);
//             return res.status(500).json({ message: "Internal server error fetching lecturer details." });
//         }
//     }

//     // --- PUT: Update lecturer profile and course assignments ---
//     if (req.method === 'PUT') {
//         const { name, email, newCourseIds } = req.body;
        
//         // 🔑 CRITICAL FIX: Ensure all expected fields are present and newCourseIds is an array
//         if (!name || !email || !Array.isArray(newCourseIds)) {
//              return res.status(400).json({ message: 'Missing required fields (name, email, or newCourseIds array).' });
//         }

//         try {
//             const currentLecturer = await prisma.user.findUnique({
//                 where: { id: lecturerId, role: UserRole.LECTURER },
//                 select: { courses: { select: { id: true } } } 
//             });

//             if (!currentLecturer) { return res.status(404).json({ message: 'Lecturer not found for update.' }); }

//             const currentCourseIds = currentLecturer.courses.map(c => c.id);
//             const coursesToConnect = newCourseIds.filter(id => !currentCourseIds.includes(id));
//             const coursesToDisconnect = currentCourseIds.filter(id => !newCourseIds.includes(id));

//             const updatedLecturer = await prisma.user.update({
//                 where: { id: lecturerId },
//                 data: {
//                     name,
//                     email,
//                     courses: {
//                         disconnect: coursesToDisconnect.map(id => ({ id })),
//                         connect: coursesToConnect.map(id => ({ id })),
//                     }
//                 },
//                 select: { id: true, name: true, email: true, role: true }
//             });

//             return res.status(200).json({ user: updatedLecturer, message: 'Lecturer updated successfully.' });

//         } catch (error) {
//             if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
//                  return res.status(409).json({ message: 'User with this email already exists.' });
//             }
//             return res.status(500).json({ message: "Internal server error updating lecturer." });
//         }
//     }

//     // --- DELETE: Delete a lecturer by ID ---
//     if (req.method === 'DELETE') {
//         try {
//             await prisma.user.delete({ where: { id: lecturerId, role: UserRole.LECTURER } });
//             return res.status(204).end();
//         } catch (error) {
//              if (error.code === 'P2025') { return res.status(404).json({ message: 'Lecturer not found for deletion.' }); }
//             return res.status(500).json({ message: 'Failed to delete lecturer.' });
//         }
//     }

//     res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
//     return res.status(405).end(`Method ${req.method} Not Allowed`);
// }