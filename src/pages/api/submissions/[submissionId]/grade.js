import prisma from '@api/prisma';
import { UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@api/auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  const { submissionId } = req.query;

  if (!session || !session.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const userId = session.user.id;
  const userRole = session.user.role;
  
  const { grade, feedback } = req.body;
  if (grade === undefined || grade === null || typeof grade !== 'number') {
    return res.status(400).json({ message: 'A valid numeric grade is required.' });
  }

  try {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      select: {
        assignment: {
          select: {
            maxPoints: true,
            course: {
              select: { 
                id: true, 
                lecturers: { select: { id: true } } 
              }
            }
          }
        }
      }
    });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found.' });
    }
    
    const course = submission.assignment.course;
    const isAssignedLecturer = course.lecturers.some(l => l.id === userId);
    const maxPoints = submission.assignment.maxPoints;

    if (userRole !== UserRole.ADMIN && !isAssignedLecturer) {
      return res.status(403).json({ message: 'Forbidden. You are not authorized to grade this submission.' });
    }

    if (grade < 0 || grade > maxPoints) {
        return res.status(400).json({ message: `Grade must be between 0 and ${maxPoints}.` });
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: grade,
        feedback: feedback || null, 
        gradedAt: new Date(),
      },
      select: {
        id: true,
        grade: true,
        feedback: true,
        submittedAt: true,
        filePath: true, 
        student: { select: { id: true, name: true, email: true } },
      }
    });

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
  }
}