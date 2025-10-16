// pages/api/auth/[...nextauth].js (Corrected)

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
// ❌ REMOVE THE ADAPTER IMPORT: import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const authOptions = {
    // ❌ FIX: Remove the adapter line if using JWT strategy
    // adapter: PrismaAdapter(prisma), 
    
    // ✅ Keep JWT strategy as it's necessary for role passing in callbacks
    session: { strategy: 'jwt' }, 
    
    providers: [
        // ... (CredentialsProvider remains the same)
        CredentialsProvider({
            name: 'Credentials', 
            credentials: { email: { label: 'Email' }, password: { label: 'Password' } },
            async authorize(credentials) {
                const user = await prisma.user.findUnique({ where: { email: credentials.email } });
                if (user && await bcrypt.compare(credentials.password, user.password)) {
                    return { id: user.id, name: user.name, email: user.email, role: user.role };
                }
                return null;
            },
        }),
    ],
    pages: { signIn: '/auth/signin', error: '/auth/signin' },
    
    // The rest of the config is correct for passing role data
    callbacks: {
        async jwt({ token, user }) { if (user) { token.id = user.id; token.role = user.role; } return token; },
        async session({ session, token }) { if (token) { session.user.id = token.id; session.user.role = token.role; } return session; },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const authHandler = NextAuth(authOptions);
export default async function handler(req, res) {
    await authHandler(req, res);
}