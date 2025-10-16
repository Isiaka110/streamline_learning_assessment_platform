// pages/api/users.js - Enhanced for robust error handling

import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
// NOTE: getSession from 'next-auth/react' is correct for API routes in Pages Router
import { getSession } from 'next-auth/react'; 

// Use globalThis to reuse the PrismaClient instance across hot reloads 
// (Good practice for Next.js to prevent "Too many clients" errors)
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, email, password, role } = req.body;
  
  // 1. Get Session for Authorization Check
  const session = await getSession({ req });
  const isAdminRequest = session?.user?.role === UserRole.ADMIN;
  
  let finalRole = UserRole.STUDENT; // Default role for all self-registrations

  // 2. Authorization and Role Determination Logic
  if (isAdminRequest) {
    // Admin request: Use the requested role if it is valid
    if (role && Object.values(UserRole).includes(role)) {
        finalRole = role;
    } else {
        // If Admin is creating a user but didn't specify a valid role, 
        // default to STUDENT or use a specific admin default if needed.
        console.warn('Admin attempted user creation without a valid role; defaulting to STUDENT.');
    }
  } else {
    // Non-Admin (Self-Registration): Role must be STUDENT
    if (role && role !== UserRole.STUDENT) {
      return res.status(403).json({ 
        message: 'Self-registration is only allowed for the Student role.' 
      });
    }
    // finalRole remains UserRole.STUDENT
  }
  
  // 3. Basic Validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields: name, email, and password.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); 

    // 4. Create the user in the database
    const newUser = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashedPassword, 
        role: finalRole // Use the determined role
      },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true 
      },
    });

    return res.status(201).json({ 
      message: `User created successfully with role: ${finalRole}`, 
      user: newUser 
    });

  } catch (error) {
    // 🌟 ENHANCEMENT: Log the error details to the terminal for debugging 🌟
    console.error('User creation failed due to Prisma/Database error:', error);
    
    // Check for unique constraint violation (email already exists)
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Email already exists. Please use a different email or sign in.' });
    }
    
    // Generic 500 error for all other unhandled database/server errors
    return res.status(500).json({ message: 'Internal Server Error during user creation.' });
  }
  // No finally block is needed to disconnect prisma when using the global instance pattern
}