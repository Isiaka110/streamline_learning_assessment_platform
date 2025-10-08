// pages/api/auth/[...nextauth].js

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs'; // Essential fix for the 'fs' error

const prisma = new PrismaClient();

const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: 'Credentials', 
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });
                if (user && await bcrypt.compare(credentials.password, user.password)) {
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role, // Pass the role
                    };
                }
                return null;
            },
        }),
    ],
    pages: {
        signIn: '/auth/signin', 
        error: '/auth/signin',
    },
    session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

// This direct export is the correct structure to prevent the destructuring error.
export default NextAuth(authOptions);