// pages/api/courses/[courseId]/enroll.js

import { PrismaClient, UserRole } from '@prisma/client';
import { getSession } from 'next-auth/react';

// Initialize Prisma Client
const prisma = new PrismaClient();

export default async function handler(req, res) {
  // 1. Only allow POST method for enrollment
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Get the session and the courseId from the URL
  const session = await getSession({ req });
  const { courseId } = req.query;

  // --- Authorization and Input Validation ---

  // 2. Check Authentication
  if (!session) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const studentId = session.user.id;
  const userRole = session.user.role;

  // 3. Check Authorization (RBAC): Only STUDENTs can enroll themselves
  if (userRole !== UserRole.STUDENT) {
    return res.status(403).json({ message: 'Forbidden. Only students can self-enroll in courses.' });
  }

  if (!courseId) {
    return res.status(400).json({ message: 'Missing courseId in request path.' });
  }

  try {
    // 4. Data Access Layer: Check if the course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({ message: `Course with ID ${courseId} not found.` });
    }

    // 5. Data Access Layer: Check if the student is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        // This leverages the unique constraint we defined in schema.prisma: @@unique([studentId, courseId])
        studentId_courseId: {
          studentId: studentId,
          courseId: courseId,
        },
      },
    });

    if (existingEnrollment) {
      return res.status(409).json({ message: 'You are already enrolled in this course.' });
    }

    // 6. Data Access Layer: Create the enrollment record
    const newEnrollment = await prisma.enrollment.create({
      data: {
        studentId: studentId,
        courseId: courseId,
      },
      select: {
        id: true,
        enrolledAt: true,
        course: {
          select: { title: true, code: true }
        }
      }
    });

    // 7. Success Response
    return res.status(201).json({
      message: `Successfully enrolled in course: ${course.title}.`,
      enrollment: newEnrollment
    });

  } catch (error) {
    console.error('Enrollment error:', error);
    // Return a generic 500 error for unexpected database/server issues
    return res.status(500).json({
      message: 'Internal Server Error during enrollment.',
      error: error.message
    });
  } finally {
    await prisma.$disconnect();
  }
}