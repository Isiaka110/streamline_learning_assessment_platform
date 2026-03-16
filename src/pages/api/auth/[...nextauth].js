import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions = {
    session: { 
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
    }, 
    providers: [
        CredentialsProvider({
            name: 'Credentials', 
            credentials: { 
                email: { label: 'Email', type: 'email' }, 
                password: { label: 'Password', type: 'password' } 
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                
                try {
                    const user = await prisma.user.findUnique({ 
                        where: { email: credentials.email.toLowerCase() } 
                    });
                    
                    if (user && await bcrypt.compare(credentials.password, user.password)) {
                        return { 
                            id: user.id, 
                            name: user.name, 
                            email: user.email, 
                            role: user.role 
                        };
                    }
                } catch (error) {
                    console.error("Auth authorize error:", error);
                }
                return null;
            },
        }),
    ],
    pages: { 
        signIn: '/auth/signin', 
        error: '/auth/signin',
    },
    callbacks: {
        async jwt({ token, user }) { 
            if (user) { 
                token.id = user.id; 
                token.role = user.role; 
            } 
            return token; 
        },
        async session({ session, token }) { 
            if (token && session.user) { 
                session.user.id = token.id; 
                session.user.role = token.role; 
            } 
            return session; 
        },
        async redirect({ url, baseUrl }) {
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            else if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);