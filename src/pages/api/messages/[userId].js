// pages/api/messages/[userId].js

import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // 1. Enforce GET Method
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 2. Extract User ID from URL
  // The 'userId' is read from the dynamic route file name: [userId].js
  const { userId } = req.query; 

  // 3. Check Authentication
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  // 4. Security Check: Ensure logged-in user is requesting their own data
  if (session.user.id !== userId) {
    // A user is trying to access another user's messages
    return res.status(403).json({ message: 'Unauthorized access: You can only view your own messages.' });
  }

  try {
    // 5. Fetch Messages: Retrieve all messages where the user is EITHER the sender OR the recipient.
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },    // Messages they sent (Outbox)
          { recipientId: userId }, // Messages they received (Inbox)
        ],
      },
      // Include sender and recipient details for display in the client
      include: {
        sender: {
          select: { id: true, name: true, email: true, role: true },
        },
        recipient: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      // Order by newest messages first
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 6. Success Response
    return res.status(200).json({ messages });

  } catch (error) {
    console.error(`Error fetching messages for user ${userId}:`, error);
    return res.status(500).json({ message: 'Internal Server Error while fetching messages.' });
  } finally {
    await prisma.$disconnect();
  }
}