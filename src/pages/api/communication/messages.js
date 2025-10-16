import prisma from '@api/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@api/auth/[...nextauth]';

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).json({ message: 'Authentication required.' });
    }
    const senderId = session.user.id;

    // --- GET: Fetch Messages/Comments for a Course ---
    if (req.method === 'GET') {
        const { courseId } = req.query;

        if (!courseId) {
            return res.status(400).json({ message: 'Missing courseId query parameter.' });
        }

        try {
            const messages = await prisma.message.findMany({
                where: {
                    courseId: courseId, 
                },
                select: {
                    id: true,
                    content: true,
                    createdAt: true,
                    senderId: true,
                    recipientId: true,
                    status: true,
                    // 🔑 FIX: Include the Sender and Recipient names
                    sender: {
                        select: { name: true }
                    },
                    recipient: {
                        select: { name: true }
                    }
                },
                orderBy: {
                    createdAt: 'desc', // Still ordered by newest first
                },
            });
            
            // 🔑 FIX: Flatten the data structure for easier client consumption
            const messagesWithNames = messages.map(msg => ({
                id: msg.id,
                content: msg.content,
                createdAt: msg.createdAt,
                senderId: msg.senderId,
                recipientId: msg.recipientId,
                status: msg.status,
                senderName: msg.sender.name,
                recipientName: msg.recipient.name,
            }));

            return res.status(200).json({ messages: messagesWithNames });

        } catch (error) {
            console.error("API Fetch Messages Database Error:", error);
            return res.status(500).json({ message: 'Failed to fetch messages.' });
        }
    }

    // --- POST: Send a New Message/Comment (Remains the same) ---
    if (req.method === 'POST') {
        const { recipientId, content, courseId } = req.body; 
        
        // ... (400 validation remains the same) ...

        try {
            const newMessage = await prisma.message.create({
                data: {
                    senderId: senderId,
                    recipientId: recipientId,
                    content: content,
                    courseId: courseId, 
                    status: 'SENT',
                },
                // 🔑 Include names in the response payload for immediate client update
                select: {
                    id: true,
                    content: true,
                    createdAt: true,
                    senderId: true,
                    recipientId: true,
                    status: true,
                    sender: { select: { name: true } },
                    recipient: { select: { name: true } }
                }
            });
            
            // Flatten the new message for client
            const newMsgFlattened = {
                id: newMessage.id,
                content: newMessage.content,
                createdAt: newMessage.createdAt,
                senderId: newMessage.senderId,
                recipientId: newMessage.recipientId,
                status: newMessage.status,
                senderName: newMessage.sender.name,
                recipientName: newMessage.recipient.name,
            };


            return res.status(201).json({ 
                message: newMsgFlattened, 
                success: true 
            });

        } catch (error) {
            console.error("API Send Message Database Error:", error);
            if (error.code === 'P2003') {
                 return res.status(404).json({ message: 'Failed to send message. One or more IDs (Sender, Recipient, or Course) are invalid in the database.' });
            }
            return res.status(500).json({ message: 'Failed to send message.' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}