// pages/api/users.js - Handles POST request for new user registration

import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getSession } from 'next-auth/react'; // Used to check the logged-in user's role

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, email, password, role } = req.body;
  
  // 1. Get the session of the user making the request
  const session = await getSession({ req });
  
  // Determine if the user is an Admin
  const isAdminRequest = session?.user?.role === UserRole.ADMIN;
  
  let finalRole = UserRole.STUDENT; // Default role for self-registration

  // 2. Authorization and Role Determination Logic
  if (isAdminRequest) {
    // If the request is from an Admin, they can create any valid role (Admin, Lecturer, Student).
    // The requested 'role' from the body is used, but defaults to STUDENT if invalid/missing.
    if (role && Object.values(UserRole).includes(role)) {
      finalRole = role;
    } else {
      // If Admin doesn't specify a role, or it's invalid, default to STUDENT or handle as error
      finalRole = UserRole.STUDENT; 
    }
  } else {
    // If NOT an Admin (i.e., self-registration)
    // 3. Security Check: Block creation of privileged roles during self-registration
    if (role && role !== UserRole.STUDENT) {
      return res.status(403).json({ 
        message: 'Self-registration is only allowed for the Student role.' 
      });
    }
    // finalRole remains UserRole.STUDENT
  }
  
  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields: name, email, and password.' });
  }

  try {
    // 4. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); 

    // 5. Create the user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword, // Store the hash
        role: finalRole, // Use the determined role (STUDENT or Admin-specified role)
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // 6. Success Response
    return res.status(201).json({ 
      message: `User created successfully with role: ${finalRole}`, 
      user: newUser 
    });

  } catch (error) {
    console.error('User creation error:', error);
    
    // Check for unique constraint violation (email already exists)
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Email already exists. Please use a different email or sign in.' });
    }
    return res.status(500).json({ message: 'Internal Server Error during user creation.' });
  } finally {
    await prisma.$disconnect();
  }
}