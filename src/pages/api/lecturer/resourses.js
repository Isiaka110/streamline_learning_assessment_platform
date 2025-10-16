// File: pages/api/lecturer/resources.js

import prisma from '@api/prisma'; 
import { UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
// 🔑 ADJUSTMENT: Assuming authOptions is located one level up in the auth folder
import { authOptions } from '../auth/[...nextauth]'; 
import { promises as fs } from 'fs';
import path from 'path';
import formidable from 'formidable';

// 🔑 CRITICAL: Disable Next.js body parser for file uploads
export const config = {
    api: {
        bodyParser: false,
    },
};

/**
 * Helper to save the uploaded file to the public/uploads directory.
 */
async function saveFileAndGetUrl(file, courseId) {
    // ⚠️ In a production environment, this should be replaced by S3/Cloudinary upload logic.
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', courseId);
    await fs.mkdir(uploadDir, { recursive: true });

    const originalName = file.originalFilename || file.newFilename || 'file';
    // Sanitize filename and prepend timestamp for uniqueness
    const filename = `${Date.now()}_${originalName.replace(/[^a-z0-9.]/gi, '_').toLowerCase()}`; 
    const filePath = path.join(uploadDir, filename);

    // Use copyFile to move the temporary file to the final destination
    await fs.copyFile(file.filepath, filePath); 
    return `/uploads/${courseId}/${filename}`; 
}

/**
 * Checks lecturer role and course assignment.
 */
async function checkLecturerCourseAccess(req, res, courseId) {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user || session.user.role !== UserRole.LECTURER || !courseId) {
        if (!session || session.user.role !== UserRole.LECTURER) {
            res.status(403).json({ message: 'Forbidden or Unauthorized access.' });
        } else {
            res.status(400).json({ message: 'Course ID is missing.' });
        }
        return null;
    }
    
    // Ensure the lecturer is actually assigned to the course
    const course = await prisma.course.findUnique({
        where: { 
            id: courseId, 
            lecturers: { some: { id: session.user.id } }
        },
    });
    
    if (!course) {
        res.status(404).json({ message: 'Course not found or Lecturer not assigned.' });
        return null;
    }
    return session;
}


export default async function handler(req, res) {
    let parsedFields = {};
    let parsedFiles = {};
    // Use courseId from query for GET/DELETE, potentially overwritten by POST/PUT body
    let effectiveCourseId = req.query.courseId; 
    const resourceId = req.query.id; 

    // 1. Handle Form Data Parsing and Authorization for POST/PUT
    if (req.method === 'POST' || req.method === 'PUT') {
        // Formidable configuration is lightweight as default is often sufficient
        const form = formidable({}); 
        try {
            // Promisify form.parse for easier async/await usage
            const [fields, files] = await new Promise((resolve, reject) => {
                form.parse(req, (err, fields, files) => {
                    if (err) return reject(err);
                    // Formidable returns arrays for field/file values, so flatten them
                    const flatFields = Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, value[0]]));
                    const flatFiles = Object.fromEntries(Object.entries(files).map(([key, value]) => [key, value[0]]));
                    resolve([flatFields, flatFiles]);
                });
            });
            parsedFields = flatFields;
            parsedFiles = flatFiles;
            
            // 🔑 IMPORTANT: For POST/PUT, the courseId comes from the form field data
            effectiveCourseId = parsedFields.courseId || effectiveCourseId; 
            
            const session = await checkLecturerCourseAccess(req, res, effectiveCourseId);
            if (!session) return; // checkLecturerCourseAccess already sent response

        } catch (error) {
            console.error("Formidable Parse/Auth Error:", error);
            return res.status(500).json({ message: 'Error processing form data or authorization failed.' });
        }
    } else { 
        // 2. Authorize for GET/DELETE (which rely solely on req.query.courseId)
        const session = await checkLecturerCourseAccess(req, res, effectiveCourseId);
        if (!session) return;
    }


    // --- GET: Fetch all resources for the specified course ---
    if (req.method === 'GET') {
        try {
            const resources = await prisma.resource.findMany({
                where: { courseId: effectiveCourseId },
                orderBy: { uploadedAt: 'desc' },
                select: { id: true, title: true, description: true, filePath: true, uploadedAt: true }
            });
            return res.status(200).json({ resources });
        } catch (error) {
            console.error("API Error (GET resource):", error);
            return res.status(500).json({ message: 'Failed to fetch resources.' });
        }
    }

    // --- POST: Create a new resource (Upload) ---
    else if (req.method === 'POST') {
        const { title, description, courseId: newCourseId } = parsedFields;
        const file = parsedFiles.file;

        if (!title || !newCourseId || !file) {
            return res.status(400).json({ message: 'Title, Course ID, and File are required.' });
        }
        
        try {
            const filePath = await saveFileAndGetUrl(file, newCourseId); 
            
            const newResource = await prisma.resource.create({
                data: { 
                    title, 
                    description, 
                    filePath, 
                    courseId: newCourseId 
                }
            });
            return res.status(201).json({ resource: newResource, message: 'Resource uploaded successfully.' });
        } catch (error) {
            console.error("API Error (POST resource):", error);
            return res.status(500).json({ message: 'Failed to create resource.' });
        }
    }
    
    // --- PUT: Update an existing resource ---
    else if (req.method === 'PUT') {
        // resourceId comes from req.query.id
        const { title, description, filePath: existingFilePath } = parsedFields;
        const file = parsedFiles.file;
        
        if (!resourceId || !title) {
            return res.status(400).json({ message: 'Resource ID and Title are required for update.' });
        }

        try {
            let newFilePath = existingFilePath;
            
            if (file) {
                // If a new file is uploaded, replace the path and potentially clean up the old file
                newFilePath = await saveFileAndGetUrl(file, effectiveCourseId); 
                // NOTE: Old file deletion logic can be added here, but is omitted for simplicity/safety.
            }
            
            const updatedResource = await prisma.resource.update({
                where: { id: resourceId, courseId: effectiveCourseId }, 
                data: { title, description, filePath: newFilePath }
            });
            return res.status(200).json({ resource: updatedResource, message: 'Resource updated successfully.' });
        } catch (error) {
            console.error("API Error (PUT resource):", error);
            if (error.code === 'P2025') { 
                return res.status(404).json({ message: 'Resource not found or not in this course.' }); 
            }
            return res.status(500).json({ message: 'Failed to update resource.' });
        }
    }

    // --- DELETE: Delete a resource --- 
    else if (req.method === 'DELETE') { 
        if (!resourceId) { return res.status(400).json({ message: 'Resource ID is required for deletion.' }); }
        
        try {
            const resourceToDelete = await prisma.resource.findUnique({ where: { id: resourceId } });
            
            // Attempt to delete the physical file first
            if (resourceToDelete && resourceToDelete.filePath && resourceToDelete.filePath.startsWith('/uploads')) {
                const absolutePath = path.join(process.cwd(), 'public', resourceToDelete.filePath);
                // Use catch to ensure database deletion still attempts even if file is missing
                await fs.unlink(absolutePath).catch(err => console.warn(`Failed to delete physical file at ${absolutePath}:`, err.message));
            }
            
            // Delete the database record
            await prisma.resource.delete({ where: { id: resourceId, courseId: effectiveCourseId } });
            return res.status(204).end(); // Success, No Content
        } catch (error) {
            console.error("API Error (DELETE resource):", error);
            if (error.code === 'P2025') { return res.status(404).json({ message: 'Resource not found or already deleted.' }); }
            return res.status(500).json({ message: 'Failed to delete resource.' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}