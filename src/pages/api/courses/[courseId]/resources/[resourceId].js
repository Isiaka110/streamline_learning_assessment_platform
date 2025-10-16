// File: pages/api/courses/[courseId]/resources/[resourceId].js

import { getSession } from 'next-auth/react'; 
import { UserRole } from '@prisma/client';
import prisma from '@api/prisma'; 
import { uploadFile } from '@lib/file-handler'; 
import fs from 'fs'; 
import path from 'path';

// CRITICAL: Must export this config to enable formidable to parse the multipart form data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to get the absolute path to a file in the public folder
const getAbsolutePath = (dbRelativePath) => {
    // 1. Remove any leading slashes/backslashes if they exist
    const normalizedPath = dbRelativePath ? dbRelativePath.replace(/^(\/|\\)/, '') : '';
    
    // 2. Join the base directory (CWD/public) with the cleaned relative path.
    return path.join(process.cwd(), 'public', normalizedPath);
};

export default async function handler(req, res) {
    const session = await getSession({ req });
    // Assume the typo has been fixed in the file name or destructuring is correct
    const { courseId, resourceId } = req.query; 

    // ✅ FIX 1: Early validation for critical query parameters
    if (!courseId || !resourceId) {
        console.error("API Error: Missing courseId or resourceId in request query.");
        return res.status(400).json({ message: 'Missing course or resource ID in request path.' });
    }

    if (!session || session.user.role !== UserRole.LECTURER) {
        return res.status(403).json({ message: 'Authorization required. Must be a Lecturer.' });
    }
    const userId = session.user.id;

    // --- Authorization Check (Lecturer must be assigned to course) ---
    try {
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { lecturers: { select: { id: true } } }
        });

        if (!course || !course.lecturers.some(l => l.id === userId)) {
            return res.status(403).json({ message: 'Forbidden. User is not an assigned lecturer for this course.' });
        }
    } catch (authError) {
        console.error('API Error: Course authorization check failed:', authError);
        return res.status(500).json({ message: 'Failed during authorization check.' });
    }
    
    // ====================================================================
    // --- PUT: UPDATE RESOURCE ---
    // ====================================================================
    if (req.method === 'PUT') {
        let uploadedFile = null;
        let fileToCleanupPath = null; 

        try {
            // 1. Fetch current resource 
            const existingResource = await prisma.resource.findUnique({
                where: { id: resourceId },
                select: { id: true, filePath: true, title: true, type: true }
            });

            if (!existingResource) {
                return res.status(404).json({ message: 'Resource not found.' });
            }
            
            // 2. Parse form data (MUST handle file-less submission gracefully)
            const { fields, file } = await uploadFile(req); 
            uploadedFile = file;

            // 3. Prepare update data
            const newTitle = fields.title ? fields.title[0].trim() : existingResource.title;
            const newType = fields.type ? fields.type[0] : existingResource.type;
            const updateData = { title: newTitle, type: newType };

            // 4. Handle file replacement
            if (uploadedFile) {
                const fileName = path.basename(uploadedFile.filepath);
                const uploadsDir = '/uploads/resources';
                // Path stored in DB is relative: /uploads/resources/filename.ext
                const newFilePath = path.join(uploadsDir, fileName).replace(/\\/g, '/');
                
                updateData.filePath = newFilePath;
                fileToCleanupPath = existingResource.filePath;
            } 
            
            // 5. Update the resource record
            const updatedResource = await prisma.resource.update({
                where: { id: resourceId },
                data: updateData,
                select: { id: true, title: true, filePath: true, type: true }
            });

            // 6. Cleanup the old file (Resilient File Deletion)
            if (fileToCleanupPath && updatedResource.filePath !== fileToCleanupPath) {
                const fullOldPath = getAbsolutePath(fileToCleanupPath);
                
                try {
                    if (fs.existsSync(fullOldPath)) {
                        fs.unlinkSync(fullOldPath);
                    }
                } catch (cleanupError) {
                    console.error(`File Cleanup Warning: Failed to unlink old file ${fileToCleanupPath}.`, cleanupError);
                    // Continue, as DB is primary, but this was likely the cause of the previous 500.
                }
            }

            return res.status(200).json({ 
                message: `Resource "${updatedResource.title}" updated successfully.`, 
                resource: updatedResource 
            });

        } catch (error) {
            console.error('API Error (PUT /resources/[resourceId]):', error);
            
            // Cleanup the NEWLY uploaded file if the database update failed
            if (uploadedFile?.filepath && fs.existsSync(uploadedFile.filepath)) {
                 try {
                     fs.unlinkSync(uploadedFile.filepath);
                 } catch (cleanupError) {
                     console.error('File Cleanup Warning: Failed to clean up new upload after DB error:', cleanupError);
                 }
            }
            
            return res.status(500).json({ 
                message: 'Internal Server Error during resource update.', 
                error: error.message 
            });
        }
    } 
    
    // ====================================================================
    // --- DELETE: DELETE RESOURCE ---
    // ====================================================================
    else if (req.method === 'DELETE') {
        let deletedFilePath = null;
        try {
            const resourceToDelete = await prisma.resource.findUnique({
                where: { id: resourceId },
                select: { filePath: true }
            });

            if (!resourceToDelete) {
                return res.status(404).json({ message: 'Resource not found.' });
            }
            deletedFilePath = resourceToDelete.filePath;

            // 2. Delete the record
            await prisma.resource.delete({
                where: { id: resourceId },
            });

            // 3. Delete the file from the file system
            if (deletedFilePath) {
                const fullPath = getAbsolutePath(deletedFilePath);
                
                try {
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    }
                } catch (fileError) {
                    // CRITICAL: Log the error and return 500 if file deletion fails
                    console.error(`File Deletion FATAL Error: Failed to unlink file ${deletedFilePath}.`, fileError);
                    return res.status(500).json({ 
                        message: `Internal Server Error: Database record deleted, but file system cleanup failed.`, 
                        error: fileError.message 
                    });
                }
            }
            
            return res.status(204).end(); 

        } catch (error) {
            console.error('API Error (DELETE /resources/[resourceId]):', error);
            return res.status(500).json({ 
                message: 'Internal Server Error during resource deletion.', 
                error: error.message 
            });
        }
    }
    
    // --- Method Not Allowed ---
    else {
        res.setHeader('Allow', ['PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}