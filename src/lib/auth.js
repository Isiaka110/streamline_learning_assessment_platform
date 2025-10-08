// lib/auth.js

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma Client (ensure only one instance)
const prisma = new PrismaClient();

// The main configuration object for NextAuth
export const authOptions = {
  // 1. Adapter (Data Access Layer)
  // This tells NextAuth to use your database via Prisma
  adapter: PrismaAdapter(prisma),

  // 2. Providers (Authentication Methods)
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g., "Sign in with...")
      name: "Credentials",
      // fields: { email: { label: "Email", type: "text" }, password: { label: "Password", type: "password" } },
      
      // Custom Authorization Logic (Business Logic Layer)
      async authorize(credentials) {
        // Find the user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // If no user is found, return null
        if (!user) {
          return null;
        }

        // Compare the submitted password with the stored hashed password
        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        // If the password matches, return the user object
        if (isValid) {
          // IMPORTANT: Only return safe fields (exclude passwordHash)
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role, // Include the role for authorization (RBAC)
          };
        }

        // If credentials are invalid, return null
        return null;
      },
    }),
    // You can add more providers here (e.g., Google, GitHub)
  ],

  // 3. Callbacks (For Role-Based Access Control)
  callbacks: {
    // Modify the JWT to include the user role
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    // Modify the session to expose the user role and ID
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },

  // 4. Session Strategy
  session: {
    // Use JWT strategy because we are using an API-only approach with Next.js
    strategy: "jwt",
  },

  // 5. Pages
  pages: {
    // Specify the custom sign-in page path
    signIn: '/auth/signin', 
  }
};