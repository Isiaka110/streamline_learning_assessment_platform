// pages/api/submissions/[submissionId]/grade.js

import { PrismaClient, UserRole } from '@prisma/client';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // 1. Only allow PATCH/PUT method for updating a grade
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getSession({ req });
  const { submissionId } = req.query;

  // --- Authorization Check ---
  
  // 2. Check Authentication
  if (!session) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const userId = session.user.id;
  const userRole = session.user.role;
  
  // 3. Check Input
  const { grade, feedback } = req.body;
  if (grade === undefined || grade === null || typeof grade !== 'number') {
    return res.status(400).json({ message: 'A valid numeric grade is required.' });
  }

  try {
    // 4. Data Access Layer: Fetch Submission and related Course/Lecturer info
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          select: {
            maxPoints: true,
            course: {
              select: { lecturerId: true, title: true }
            }
          }
        }
      }
    });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found.' });
    }
    
    // Extract ownership details
    const courseLecturerId = submission.assignment.course.lecturerId;
    const maxPoints = submission.assignment.maxPoints;

    // 5. Check Authorization (RBAC): Must be the course's lecturer OR an Admin
    if (userRole !== UserRole.ADMIN && courseLecturerId !== userId) {
      return res.status(403).json({ message: 'Forbidden. You are not authorized to grade this submission.' });
    }

    // 6. Business Logic: Grade validation
    if (grade < 0 || grade > maxPoints) {
        return res.status(400).json({ message: `Grade must be between 0 and ${maxPoints}.` });
    }

    // 7. Data Access Layer: Update the submission record
    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: grade,
        feedback: feedback || null, // Allow feedback to be optional
      },
      select: {
        id: true,
        grade: true,
        feedback: true,
        submittedAt: true,
        student: { select: { name: true } },
        assignment: { select: { title: true } }
      }
    });

    // 8. Success Response
    return res.status(200).json({ 
      message: `Grade of ${grade}/${maxPoints} recorded successfully.`, 
      submission: updatedSubmission 
    });

  } catch (error) {
    console.error('Grading error:', error);
    return res.status(500).json({ 
      message: 'Internal Server Error during grading.', 
      error: error.message 
    });
  } finally {
    await prisma.$disconnect();
  }
}