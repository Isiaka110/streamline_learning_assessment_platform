// prisma/seed.js (using CommonJS syntax for max compatibility)

const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcryptjs'); // Must be installed: npm install bcryptjs

const prisma = new PrismaClient();
const saltRounds = 10;

// Configuration using Environment Variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@lms.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminPassword123';

async function main() {
    console.log('Start seeding (Admin only)...');

    // --- 1. ADMIN USER ---
    const hashedPasswordAdmin = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);

    const admin = await prisma.user.upsert({
        where: { email: ADMIN_EMAIL },
        update: { password: hashedPasswordAdmin, role: UserRole.ADMIN },
        create: {
            email: ADMIN_EMAIL,
            password: hashedPasswordAdmin,
            name: 'System Administrator',
            role: UserRole.ADMIN,
        },
    });
    console.log(`Created/Updated admin: ${admin.email}`);

    // --- LOGINS SUMMARY ---
    console.log('\n=======================================');
    console.log('         SEEDED ACCOUNTS');
    console.log('=======================================');
    console.log(`ADMIN:     ${ADMIN_EMAIL}   | Password: ${ADMIN_PASSWORD}`);
    console.log('=======================================\n');
}

main()
    .catch((e) => {
        console.error('Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });