// pages/api/courses/[courseId]/resources/index.js

import { PrismaClient, UserRole } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { uploadFile, config as uploadConfig } from '../../../lib/file-handler';
import path from 'path';

const prisma = new PrismaClient();

// Must export this config to enable file upload via formidable
export const config = uploadConfig; 

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getSession({ req });
  const { courseId } = req.query;

  // 1. Check Authentication & Authorization (Initial)
  if (!session) {
    return res.status(401).json({ message: 'Authentication required.' });
  }
  const userId = session.user.id;
  const userRole = session.user.role;
  
  if (userRole !== UserRole.LECTURER && userRole !== UserRole.ADMIN) {
    return res.status(403).json({ message: 'Forbidden. Only Lecturers and Admins can upload resources.' });
  }

  let uploadedFile = null;
  let resourceTitle = null; 

  try {
    // 2. Process File Upload and Fields
    const { fields, file } = await uploadFile(req);
    uploadedFile = file;
    
    // Get the title from the form fields (Note: fields are returned as arrays by formidable)
    resourceTitle = fields.title ? fields.title[0] : null;

    if (!uploadedFile) {
        return res.status(400).json({ message: 'No file provided for resource upload.' });
    }
    if (!resourceTitle || resourceTitle.trim() === '') {
         return res.status(400).json({ message: 'Resource title is required.' });
    }

    // 3. Data Access Layer: Verify the Course and Lecturer Ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { lecturerId: true, title: true } 
    });

    if (!course) {
      return res.status(404).json({ message: `Course with ID ${courseId} not found.` });
    }

    // 4. Final Authorization Check (Must be the course's lecturer OR an Admin)
    if (userRole !== UserRole.ADMIN && course.lecturerId !== userId) {
      return res.status(403).json({ message: 'Forbidden. You are not the lecturer for this course.' });
    }
    
    // 5. Construct File Path
    // Path relative to the public directory
    const filePath = path.join('/submissions', path.basename(uploadedFile.filepath)); 

    // 6. Data Access Layer: Create the new resource record
    const newResource = await prisma.resource.create({
      data: {
        title: resourceTitle,
        filePath: filePath,
        courseId: courseId,
      },
      select: {
        id: true,
        title: true,
        filePath: true,
        uploadedAt: true,
      }
    });

    // 7. Success Response
    return res.status(201).json({ 
      message: `Resource "${newResource.title}" uploaded successfully to ${course.title}.`, 
      resource: newResource 
    });

  } catch (error) {
    console.error('Resource upload error:', error);
    // Handle specific formidable errors (e.g., file size)
    return res.status(500).json({ 
      message: 'Internal Server Error during resource upload.', 
      error: error.message 
    });
  } finally {
    await prisma.$disconnect();
    // In a cleanup scenario, you'd handle file deletion if the database transaction failed
  }
}