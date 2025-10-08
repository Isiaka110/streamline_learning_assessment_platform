// pages/api/courses/[courseId]/assignments/index.js

import { PrismaClient, UserRole } from '@prisma/client';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // 1. Only allow POST method for creation
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Get the session and the courseId from the URL
  const session = await getSession({ req });
  const { courseId } = req.query;

  // --- Authorization Check (Business Logic Layer) ---

  // 2. Check Authentication
  if (!session) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const userId = session.user.id;
  const userRole = session.user.role;

  // 3. Input Validation
  const { title, description, dueDate, maxPoints } = req.body;
  
  if (!title || !dueDate || maxPoints === undefined || !courseId) {
    return res.status(400).json({ message: 'Missing required fields: title, dueDate, maxPoints, or courseId.' });
  }

  try {
    // 4. Data Access Layer: Verify the Course and Lecturer Ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { lecturerId: true, title: true } // Need lecturerId for the RBAC check
    });

    if (!course) {
      return res.status(404).json({ message: `Course with ID ${courseId} not found.` });
    }

    // 5. Check Authorization (RBAC): Must be the course's lecturer OR an Admin
    if (userRole !== UserRole.ADMIN && course.lecturerId !== userId) {
      return res.status(403).json({ message: 'Forbidden. You are not the lecturer for this course.' });
    }
    
    // 6. Data Access Layer: Create the new assignment
    const newAssignment = await prisma.assignment.create({
      data: {
        title,
        description: description || null,
        dueDate: new Date(dueDate), // Convert ISO string date to a Date object
        maxPoints: parseInt(maxPoints), // Ensure maxPoints is an integer
        courseId: courseId,
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        maxPoints: true,
        course: {
            select: { title: true, code: true }
        }
      }
    });

    // 7. Success Response
    return res.status(201).json({ 
      message: `Assignment "${newAssignment.title}" created successfully for ${course.title}.`, 
      assignment: newAssignment 
    });

  } catch (error) {
    console.error('Assignment creation error:', error);
    // Handle specific errors like date parsing failure if possible
    return res.status(500).json({ 
      message: 'Internal Server Error during assignment creation.', 
      error: error.message 
    });
  } finally {
    await prisma.$disconnect();
  }
}