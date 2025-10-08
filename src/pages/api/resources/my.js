// pages/api/resources/my.js

import { PrismaClient, UserRole } from '@prisma/client';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getSession({ req });

  // 1. Check Authentication & Authorization
  if (!session) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const studentId = session.user.id;
  if (session.user.role !== UserRole.STUDENT) {
    return res.status(403).json({ message: 'Forbidden. Only students can view enrolled course resources.' });
  }

  try {
    // 2. Data Access Layer: Find all Course IDs the student is enrolled in
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: studentId },
      select: { courseId: true },
    });
    
    // Extract a simple array of course IDs
    const enrolledCourseIds = enrollments.map(e => e.courseId);

    // 3. Data Access Layer: Fetch resources for those courses
    const courseResources = await prisma.resource.findMany({
      where: {
        // This is the key logic: filter resources where the courseId is in the list
        courseId: {
          in: enrolledCourseIds,
        },
      },
      // Include course and lecturer details for context
      include: {
        course: {
          select: {
            title: true,
            code: true,
            lecturer: { select: { name: true } },
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });

    // 4. Success Response
    return res.status(200).json({ resources: courseResources });

  } catch (error) {
    console.error('Fetch student resources error:', error);
    return res.status(500).json({ 
      message: 'Internal Server Error fetching resources.', 
      error: error.message 
    });
  } finally {
    await prisma.$disconnect();
  }
}