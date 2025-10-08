// pages/api/assignments/[assignmentId]/submissions.js

import { PrismaClient, UserRole } from '@prisma/client';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getSession({ req });
  const { assignmentId } = req.query;

  if (!session) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const userId = session.user.id;
  const userRole = session.user.role;

  if (!assignmentId) {
    return res.status(400).json({ message: 'Missing assignmentId.' });
  }

  try {
    // 1. Data Access Layer: Verify the Assignment and Lecturer Ownership
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: { 
          maxPoints: true,
          course: { 
              select: { lecturerId: true } 
          } 
      }
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    // 2. Check Authorization (RBAC)
    const courseLecturerId = assignment.course.lecturerId;
    if (userRole !== UserRole.ADMIN && courseLecturerId !== userId) {
      return res.status(403).json({ message: 'Forbidden. You are not authorized to view submissions for this assignment.' });
    }

    // 3. Data Access Layer: Fetch all submissions for the assignment
    const submissions = await prisma.submission.findMany({
      where: { assignmentId: assignmentId },
      select: {
        id: true,
        submittedAt: true,
        submissionPath: true, // Path to the file
        grade: true,
        feedback: true,
        student: { // Include student name and email
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    // 4. Success Response
    return res.status(200).json({ 
        submissions, 
        maxPoints: assignment.maxPoints 
    });

  } catch (error) {
    console.error('Fetch submissions error:', error);
    return res.status(500).json({ message: 'Internal Server Error fetching submissions.' });
  } finally {
    await prisma.$disconnect();
  }
}