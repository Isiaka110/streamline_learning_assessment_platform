// pages/api/courses/index.js (Updated to handle GET requests)

import { PrismaClient, UserRole } from '@prisma/client';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  // --- Handle GET Request (Fetch All/Lecturer's Courses) ---
  if (req.method === 'GET') {
    // 1. Define the filter object
    let whereCondition = {}; 

    // 2. Filter logic: If the user is a LECTURER, only show their courses
    if (session.user.role === UserRole.LECTURER) {
      whereCondition = {
        lecturerId: session.user.id,
      };
    }
    // Note: ADMINs (and Students, if they hit this endpoint) will see ALL courses (empty whereCondition)

    try {
      // 3. Data Access Layer: Fetch courses with the applied filter
      const courses = await prisma.course.findMany({
        where: whereCondition, // Apply the lecturer filter if needed
        select: {
          id: true,
          title: true,
          code: true,
          description: true,
          lecturer: {
            select: { name: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return res.status(200).json({ courses });

    } catch (error) {
      console.error('Fetch courses error:', error);
      return res.status(500).json({ message: 'Failed to fetch courses.' });
    }
  }

  // --- Handle POST Request (Course Creation - existing logic) ---
  if (req.method === 'POST') {
    // ... (KEEP THE EXISTING COURSE CREATION LOGIC HERE) ...
    // NOTE: Copy the entire POST block from the previous step and paste it here.
    
    const userRole = session.user.role;
    // 3. Check Authorization (RBAC)
    if (userRole !== UserRole.LECTURER && userRole !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Forbidden. Only Lecturers can create courses.' });
    }
    // ... rest of the POST logic ...
    
    // To keep this response short, please ensure you copy the previous POST logic 
    // into this file to make it handle both GET and POST requests.
    return res.status(405).json({ message: 'Method Not Allowed' }); // Default if no logic runs
  }
}