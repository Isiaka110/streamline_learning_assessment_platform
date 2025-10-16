import { PrismaClient, UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
// ⚠️ Adjust path to match your actual authOptions location
import { authOptions } from '../../auth/[...nextauth]'; 

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function handler(req, res) {
    
    // 🔑 Step 1: Security Check (Must run first for all protected methods)
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Access Denied: Admin role required.' });
    }

    const { userId } = req.query; 

    if (!userId) {
        return res.status(400).json({ message: 'Missing user ID.' });
    }

    // --- UPDATE (U): Edit existing user/lecturer ---
    if (req.method === 'PUT' || req.method === 'PATCH') {
        const { name, email, role } = req.body;
        
        // Simple validation: ensure Admin isn't trying to change their own ID or role logic
        if (userId === session.user.id && role !== UserRole.ADMIN) {
             return res.status(403).json({ message: 'Cannot modify your own Admin role or delete your account via this route.' });
        }
        
        try {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { name, email, role },
            });
            
            return res.status(200).json({ user: updatedUser, message: 'User updated successfully.' });
        } catch (error) {
            console.error('User Update Error:', error);
            if (error.code === 'P2025') {
                return res.status(404).json({ message: 'User not found.' });
            }
            if (error.code === 'P2002' && error.meta?.target.includes('email')) {
                return res.status(409).json({ message: 'Email already in use.' });
            }
            return res.status(500).json({ message: 'Failed to update user.' });
        }
    }
    
    // --- DELETE (D): Delete an existing user/lecturer ---
    if (req.method === 'DELETE') {
        // Prevent accidental deletion of the current Admin user
        if (userId === session.user.id) {
             return res.status(403).json({ message: 'Cannot delete the currently logged-in Admin user.' });
        }
        
        try {
            await prisma.user.delete({
                where: { id: userId },
            });
            
            return res.status(200).json({ message: `User ${userId} deleted successfully.` });
        } catch (error) {
            console.error('User Delete Error:', error);
            if (error.code === 'P2025') {
                return res.status(404).json({ message: 'User not found.' });
            }
            // Handle foreign key error (P2003) if the user is linked to courses/enrollments
            if (error.code === 'P2003') {
                 return res.status(409).json({ message: 'Cannot delete user: They are currently assigned to courses or have existing records.' });
            }
            return res.status(500).json({ message: 'Failed to delete user.' });
        }
    }

    // --- READ (R): Fetch a single user/lecturer ---
    if (req.method === 'GET') {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, name: true, email: true, role: true } // Return sensitive data as Admin
            });
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }
            return res.status(200).json({ user });
        } catch (error) {
            return res.status(500).json({ message: 'Failed to fetch user details.' });
        }
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
}