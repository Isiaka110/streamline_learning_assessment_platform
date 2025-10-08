// pages/api/auth/signup.js

import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Initialize Prisma Client (ensure only one instance)
const prisma = new PrismaClient();

// This handler receives the POST request for new user registration
export default async function handler(req, res) {
  // 1. Restriction: Only allow POST requests for registration
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Destructure and validate input from the request body
  const { name, email, password, role } = req.body;

  // 2. Input Validation (Business Logic Layer)
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Missing required fields: name, email, or password' });
  }

  // Basic password length check
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }

  try {
    // 3. Check for Existing User
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    // 4. Secure Password Hashing (Crucial Step)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 5. Determine User Role and Sanitization
    // By default, new registrations are STUDENTs, unless explicitly specified as LECTURER or ADMIN
    // NOTE: In a real app, only ADMINs should be able to register LECTURER/ADMIN roles.
    let userRole = UserRole.STUDENT;
    if (role && (role === 'LECTURER' || role === 'ADMIN')) {
      // Simple logic for setting role (you might restrict this in the future)
      userRole = role; 
    }

    // 6. Create User (Data Access Layer)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: userRole,
      },
      // Select only safe fields to return
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // 7. Success Response
    res.status(201).json({ 
      message: 'User created successfully', 
      user: newUser 
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Internal Server Error during registration', 
      error: error.message 
    });
  } finally {
    await prisma.$disconnect(); // Clean up the database connection
  }
}