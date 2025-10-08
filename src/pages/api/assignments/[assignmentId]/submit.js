// pages/api/assignments/[assignmentId]/submit.js

import { PrismaClient, UserRole } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { uploadFile, config as uploadConfig } from '../../../lib/file-handler'; // Import the file handler
import path from 'path'; // Needed for file path manipulation

const prisma = new PrismaClient();

// Must export this config to enable file upload via formidable
export const config = uploadConfig; 

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getSession({ req });
  const { assignmentId } = req.query;

  // 1. Check Authentication & Authorization
  if (!session) {
    return res.status(401).json({ message: 'Authentication required.' });
  }
  const studentId = session.user.id;
  if (session.user.role !== UserRole.STUDENT) {
    return res.status(403).json({ message: 'Forbidden. Only students can submit assignments.' });
  }
  if (!assignmentId) {
    return res.status(400).json({ message: 'Missing assignmentId.' });
  }

  let uploadedFile = null;
  try {
    // 2. Process File Upload
    const { file } = await uploadFile(req);
    uploadedFile = file;

    if (!uploadedFile) {
        return res.status(400).json({ message: 'No file provided for submission.' });
    }
    
    // Construct the file path relative to the public directory for storage
    // NOTE: In production, this would be a URL to S3/GCS
    const submissionPath = path.join('/submissions', path.basename(uploadedFile.filepath));

    // 3. Data Access Layer: Check Assignment and Deadline
    const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        select: { dueDate: true, title: true, maxPoints: true }
    });

    if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found.' });
    }

    if (new Date() > assignment.dueDate) {
        // NOTE: In a real app, you might allow late submissions with a penalty.
        return res.status(403).json({ message: 'Submission failed: The deadline for this assignment has passed.' });
    }

    // 4. Data Access Layer: Check for existing submission (and update/create)
    const existingSubmission = await prisma.submission.findUnique({
        where: {
            studentId_assignmentId: {
                studentId: studentId,
                assignmentId: assignmentId,
            }
        }
    });
    
    let submissionRecord;
    
    if (existingSubmission) {
        // If re-submitting, update the existing record
        submissionRecord = await prisma.submission.update({
            where: { id: existingSubmission.id },
            data: {
                submissionPath: submissionPath,
                submittedAt: new Date(),
                // Reset grade and feedback upon re-submission
                grade: null, 
                feedback: null, 
            },
        });
        
    } else {
        // First submission, create a new record
        submissionRecord = await prisma.submission.create({
            data: {
                studentId: studentId,
                assignmentId: assignmentId,
                submissionPath: submissionPath,
            },
        });
    }

    // 5. Success Response
    return res.status(200).json({ 
        message: `Submission successful for "${assignment.title}".`, 
        submission: submissionRecord 
    });

  } catch (error) {
    console.error('Submission error:', error);
    // Handle specific formidable errors (e.g., file size)
    if (error.code === 1009) { // Example: Formidable file size error code
         return res.status(413).json({ message: 'File upload failed: File too large.' });
    }
    return res.status(500).json({ 
      message: 'Internal Server Error during file submission.', 
      error: error.message 
    });
  } finally {
    await prisma.$disconnect();
    // In a cleanup scenario, you'd handle file deletion if the database transaction failed
  }
}