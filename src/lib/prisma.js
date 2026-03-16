// lib/prisma.js

import { PrismaClient } from '@prisma/client';

let prisma;

// Recommended pattern for Next.js to prevent multiple instances of PrismaClient 
// in development (caused by hot-reloading)
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;