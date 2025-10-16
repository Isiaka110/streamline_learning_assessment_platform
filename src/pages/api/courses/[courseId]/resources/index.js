// pages/api/courses/[courseId]/resources/index.js

import { getSession } from 'next-auth/react'; 
import { UserRole } from '@prisma/client';
import prisma from '@api/prisma'; 
import { uploadFile } from '@lib/file-handler'; // Use alias
import path from 'path';
import fs from 'fs'; 

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
    const session = await getSession({ req });
    const { courseId } = req.query;

    if (!session || !session.user || !session.user.id || !session.user.role) {
        return res.status(401).json({ message: 'Authentication required or session is invalid.' });
    }
    const userRole = session.user.role;
    const userId = session.user.id;

    // --- GET: LIST RESOURCES ---
    if (req.method === 'GET') {
        // 1. Authorization: Lecturer/Admin for resource management, or Student for viewing
        // Since this is the lecturer dashboard, we check for LECTURER or ADMIN
        if (userRole !== UserRole.LECTURER && userRole !== UserRole.ADMIN) {
             return res.status(403).json({ message: 'Forbidden. Only Lecturers and Admins can manage resources.' });
        }
        
        try {
            // 2. Fetch Course and Resources
            const course = await prisma.course.findUnique({
                where: { id: courseId },
                select: { 
                    title: true, 
                    // Select the lecturers relation for M:M ownership check
                    lecturers: { select: { id: true } },
                    // Select the resources related to this course
                    resources: {
                        select: {
                            id: true,
                            title: true,
                            filePath: true,
                            uploadedAt: true,
                            type: true,
                            description: true,
                        },
                        // Order by newest first
                        orderBy: {
                            uploadedAt: 'desc',
                        }
                    }
                }
            });

            if (!course) {
                return res.status(404).json({ message: `Course with ID ${courseId} not found.` });
            }

            // 3. Final M:M Authorization Check (Lecturer must be assigned to this course)
            const isCourseLecturer = course.lecturers.some(lecturer => lecturer.id === userId);
            
            if (userRole === UserRole.LECTURER && !isCourseLecturer) {
                return res.status(403).json({ message: 'Forbidden. You are not assigned to this course.' });
            }

            // 4. Success Response
            return res.status(200).json({ 
                message: `Found ${course.resources.length} resources for ${course.title}.`,
                resources: course.resources 
            });

        } catch (error) {
            console.error('API Error (GET /resources):', error);
            return res.status(500).json({ message: 'Internal Server Error while fetching resources.', error: error.message });
        }
    } 
    
    // --- POST: UPLOAD RESOURCE (Existing Logic) ---
    else if (req.method === 'POST') {
        // ... (The rest of your POST logic from the previous answer goes here) ...
        // Check authorization, handle file upload, save to DB, etc.
        
        // --- START OF POST LOGIC ---

        if (userRole !== UserRole.LECTURER && userRole !== UserRole.ADMIN) {
             return res.status(403).json({ message: 'Forbidden. Only Lecturers and Admins can upload resources.' });
        }

        let uploadedFile = null;
        let resourceTitle = null; 
        let resourceType = null;

        try {
            const { fields, file } = await uploadFile(req);
            uploadedFile = file;
            
            resourceTitle = fields.title ? fields.title[0] : null;
            resourceType = fields.type ? fields.type[0] : 'DOCUMENT';

            if (!uploadedFile) {
                return res.status(400).json({ message: 'No file provided for resource upload.' });
            }
            if (!resourceTitle || resourceTitle.trim() === '') {
                return res.status(400).json({ message: 'Resource title is required.' });
            }

            const course = await prisma.course.findUnique({
                where: { id: courseId },
                select: { 
                    title: true, 
                    lecturers: { select: { id: true } }
                } 
            });

            if (!course) {
                return res.status(404).json({ message: `Course with ID ${courseId} not found.` });
            }

            const isCourseLecturer = course.lecturers.some(lecturer => lecturer.id === userId);
            
            if (userRole !== UserRole.ADMIN && !isCourseLecturer) {
                const error = new Error('Forbidden. User is not an assigned lecturer for this course.');
                error.statusCode = 403;
                throw error; 
            }
            
            const publicPathIndex = uploadedFile.filepath.indexOf(path.join('public'));
            let filePath;
            if (publicPathIndex !== -1) {
                 filePath = uploadedFile.filepath.substring(publicPathIndex + 6).replace(/\\/g, '/');
            } else {
                 filePath = path.join('/uploads/resources', path.basename(uploadedFile.filepath)).replace(/\\/g, '/');
            }

            const newResource = await prisma.resource.create({
                data: {
                    title: resourceTitle.trim(),
                    filePath: filePath,
                    type: resourceType, 
                    course: { connect: { id: courseId } },
                },
                select: { id: true, title: true, filePath: true, type: true }
            });

            return res.status(201).json({ 
                message: `Resource "${newResource.title}" uploaded successfully.`, 
                resource: newResource 
            });

        } catch (error) {
            console.error('Resource upload error (POST):', error);
            
            if (uploadedFile?.filepath && fs.existsSync(uploadedFile.filepath)) {
                 try {
                     fs.unlinkSync(uploadedFile.filepath);
                 } catch (cleanupError) {
                     console.error('Failed to clean up uploaded file:', cleanupError);
                 }
            }

            if (error.statusCode === 403) {
                return res.status(403).json({ message: 'Forbidden. You are not authorized to upload to this course.' });
            }
            
            return res.status(500).json({ 
                message: 'Internal Server Error during resource upload.', 
                error: error.message 
            });
        }
        
        // --- END OF POST LOGIC ---
    } 
    else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}