import axios from 'axios';
import * as cheerio from 'cheerio';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// **REPLACE THESE URLS AND SELECTORS**
// NOTE: I've kept your selectors, but highly recommend making them more precise
const FACULTY_URL = 'https://aaue.waeup.org/faculties/FPS/CSC/courses/CSC101';
const COURSE_CATALOG_URL = 'https://aaue.waeup.org/faculties/FPS/CSC/certificates/BSCCSC';
const FACULTY_NAME_SELECTOR = '.kofa-body tbody .kofa-content .table'; 
const COURSE_TITLE_SELECTOR = '.content .kofa-content-wide';


export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    
    // NOTE: For security, you should protect this route to only allow ADMIN access
    // if (!session || session.user.role !== UserRole.ADMIN) { /* ... deny access ... */ }

    try {
        // --- A. SCRAPE LECTURER NAMES ---
        const lecturers = await scrapeNames(FACULTY_URL, FACULTY_NAME_SELECTOR);

        // --- B. SCRAPE COURSE TITLES ---
        const courseTitles = await scrapeNames(COURSE_CATALOG_URL, COURSE_TITLE_SELECTOR);

        // --- C. GENERATE AND SAVE TEST DATA ---
        const results = await generateAndSaveTestData(lecturers, courseTitles);

        return res.status(200).json({ 
            message: 'Test data generated successfully.',
            lecturersCreated: results.lecturersCount,
            coursesCreated: results.coursesCount,
        });

    } catch (error) {
        console.error("Scraping/Seeding Error:", error.message);
        return res.status(500).json({ message: 'Failed during data seeding.', error: error.message });
    }
}

// Helper function to handle HTTP request and Cheerio parsing
async function scrapeNames(url, selector) {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const names = [];

    $(selector).each((index, element) => {
        const name = $(element).text().trim();
        
        if (name) {
            // Step 1: Basic Cleanup - remove common titles/prefixes
            let cleanedName = name.replace(/(Dr\.|Prof\.|Mr\.|Ms\.|Ph\.D\.)\s*/gi, '').trim();
            
            // Step 2: Aggressive Cleanup - Target and remove the identified junk text
            const junkPattern = /login|user\s+name\s+or\s+id|password|notice|don't\s+forget\s+to\s+logout|cookies\s+in\s+your\s+web\s+browser|request\s+a\s+new\s+password|prerequisite\s+for\s+getting\s+parents\s+access|you\s+don't\s+have\s+an\s+account|exit\s+your\s+browser/gi;
            cleanedName = cleanedName.replace(junkPattern, '').trim();

            // Step 3: Remove excessive whitespace/newlines
            cleanedName = cleanedName.replace(/\s{2,}/g, ' ').trim();
            
            // Simple check to prevent empty strings or very short junk strings from being added
            if (cleanedName && cleanedName.length > 5) { 
                names.push(cleanedName);
            }
        }
    });
    return names;
}

// Helper function to insert data into the database
async function generateAndSaveTestData(lecturerNames, courseTitles) {
    const password = await bcrypt.hash('testpass123', 10);
    const createdLecturers = [];

    // 1. Create Test Lecturers
    for (const name of lecturerNames) {
        // Use the CLEAN name variable to generate the email
        const email = name.toLowerCase().replace(/\s+/g, '.') + '@lms-test.com';
        
        const lecturer = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                name,
                email,
                password: password, // Use a secure, known test password
                role: UserRole.LECTURER,
            },
        });
        createdLecturers.push(lecturer);
    }

    // Guard against empty lecturer list (cannot assign courses without a lecturer)
    if (createdLecturers.length === 0) {
        return { lecturersCount: 0, coursesCount: 0 };
    }

    // 2. Create Test Courses and Assign Lecturers
    const coursesToCreate = courseTitles.map((title, index) => {
        // Cycle through the created lecturers for assignment
        const lecturer = createdLecturers[index % createdLecturers.length];
        
        return {
            title: title,
            // Generate a 4-digit code (e.g., TEST-456)
            code: `TEST-${Math.floor(Math.random() * 900) + 100}`, 
            description: `Test course description for ${title}.`,
            lecturerId: lecturer.id, 
        };
    });

    // Use createMany for efficient bulk insertion
    const coursesResult = await prisma.course.createMany({
        data: coursesToCreate,
        skipDuplicates: true,
    });

    return {
        lecturersCount: createdLecturers.length,
        coursesCount: coursesResult.count,
    };
}