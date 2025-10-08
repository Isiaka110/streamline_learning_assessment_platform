// pages/api/submissions/my.js

import { PrismaClient, UserRole } from '@prisma/client';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // 1. Only allow GET method for fetching data
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getSession({ req });

  // 2. Check Authentication & Authorization
  if (!session) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const studentId = session.user.id;
  if (session.user.role !== UserRole.STUDENT) {
    return res.status(403).json({ message: 'Forbidden. Only students can view their own grades.' });
  }

  try {
    // 3. Data Access Layer: Fetch all submissions for the student
    const studentSubmissions = await prisma.submission.findMany({
      where: { studentId: studentId },
      // Include related course and assignment details for context
      include: {
        assignment: {
          select: {
            title: true,
            maxPoints: true,
            dueDate: true,
            course: {
              select: {
                title: true,
                code: true,
                lecturer: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    // 4. Success Response
    return res.status(200).json({ submissions: studentSubmissions });

  } catch (error) {
    console.error('Fetch student submissions error:', error);
    return res.status(500).json({ 
      message: 'Internal Server Error fetching grades.', 
      error: error.message 
    });
  } finally {
    await prisma.$disconnect();
  }
}