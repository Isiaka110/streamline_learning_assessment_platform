// File: pages/api/submissions/[submissionId]/grade.js

import { PrismaClient, UserRole } from '@prisma/client';
// 🔑 FIX 1: Change to use getServerSession from 'next-auth/next'
import { getServerSession } from 'next-auth/next'; 
// NOTE: You must import authOptions for session retrieval on the server
import { authOptions } from '@api/auth/[...nextauth]'; 

// Use the recommended method for instantiating Prisma in API routes
const prisma = new PrismaClient();

export default async function handler(req, res) {
  // 1. Method Check
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 2. Check Authentication using the CORRECT SERVER-SIDE function
  const session = await getServerSession(req, res, authOptions);
  const { submissionId } = req.query;

  if (!session || !session.user) {
    // This resolves the "Authentication required." error due to bad session retrieval
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const userId = session.user.id;
  const userRole = session.user.role;
  
  // 3. Input Validation
  const { grade, feedback } = req.body;
  if (grade === undefined || grade === null || typeof grade !== 'number') {
    return res.status(400).json({ message: 'A valid numeric grade is required.' });
  }

  try {
    // 4. Data Access Layer: Fetch Submission and related Course/Assignment info
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      select: {
        assignment: {
          select: {
            maxPoints: true,
            course: {
              select: { 
                id: true, 
                title: true,
                // 🔑 FIX 2: Instead of lecturerId, fetch the 'lecturers' relation for the check
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

    // 5. Check Authorization (RBAC): Must be the course's lecturer OR an Admin
    if (userRole !== UserRole.ADMIN && !isAssignedLecturer) {
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
        feedback: feedback || null, 
        // Optional: Add timestamp for gradedAt if desired
        gradedAt: new Date(),
      },
      // Select fields needed by the client's AssignmentGradingTool.js
      select: {
        id: true,
        grade: true,
        feedback: true,
        submittedAt: true,
        // 🔑 IMPORTANT: Include filePath if needed for re-render consistency
        filePath: true, 
        student: { select: { id: true, name: true, email: true } },
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
    // Cleanly disconnect from Prisma client instance (though not always strictly necessary in Next.js)
    // await prisma.$disconnect(); 
  }
}



// // pages/api/submissions/[submissionId]/grade.js

// import { PrismaClient, UserRole } from '@prisma/client';
// import { getSession } from 'next-auth/react';

// const prisma = new PrismaClient();

// export default async function handler(req, res) {
//   // 1. Only allow PATCH/PUT method for updating a grade
//   if (req.method !== 'PATCH') {
//     return res.status(405).json({ message: 'Method Not Allowed' });
//   }

//   const session = await getSession({ req });
//   const { submissionId } = req.query;

//   // --- Authorization Check ---
  
//   // 2. Check Authentication
//   if (!session) {
//     return res.status(401).json({ message: 'Authentication required.' });
//   }

//   const userId = session.user.id;
//   const userRole = session.user.role;
  
//   // 3. Check Input
//   const { grade, feedback } = req.body;
//   if (grade === undefined || grade === null || typeof grade !== 'number') {
//     return res.status(400).json({ message: 'A valid numeric grade is required.' });
//   }

//   try {
//     // 4. Data Access Layer: Fetch Submission and related Course/Lecturer info
//     const submission = await prisma.submission.findUnique({
//       where: { id: submissionId },
//       include: {
//         assignment: {
//           select: {
//             maxPoints: true,
//             course: {
//               select: { lecturerId: true, title: true }
//             }
//           }
//         }
//       }
//     });

//     if (!submission) {
//       return res.status(404).json({ message: 'Submission not found.' });
//     }
    
//     // Extract ownership details
//     const courseLecturerId = submission.assignment.course.lecturerId;
//     const maxPoints = submission.assignment.maxPoints;

//     // 5. Check Authorization (RBAC): Must be the course's lecturer OR an Admin
//     if (userRole !== UserRole.ADMIN && courseLecturerId !== userId) {
//       return res.status(403).json({ message: 'Forbidden. You are not authorized to grade this submission.' });
//     }

//     // 6. Business Logic: Grade validation
//     if (grade < 0 || grade > maxPoints) {
//         return res.status(400).json({ message: `Grade must be between 0 and ${maxPoints}.` });
//     }

//     // 7. Data Access Layer: Update the submission record
//     const updatedSubmission = await prisma.submission.update({
//       where: { id: submissionId },
//       data: {
//         grade: grade,
//         feedback: feedback || null, // Allow feedback to be optional
//       },
//       select: {
//         id: true,
//         grade: true,
//         feedback: true,
//         submittedAt: true,
//         student: { select: { name: true } },
//         assignment: { select: { title: true } }
//       }
//     });

//     // 8. Success Response
//     return res.status(200).json({ 
//       message: `Grade of ${grade}/${maxPoints} recorded successfully.`, 
//       submission: updatedSubmission 
//     });

//   } catch (error) {
//     console.error('Grading error:', error);
//     return res.status(500).json({ 
//       message: 'Internal Server Error during grading.', 
//       error: error.message 
//     });
//   } finally {
//     await prisma.$disconnect();
//   }
// }