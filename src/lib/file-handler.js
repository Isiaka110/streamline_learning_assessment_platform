// lib/file-handler.js

import * as fs from 'fs'; 
import formidable from 'formidable';
import path from 'path';

// Define the directory where uploaded resource files will be stored
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'resources');

// Define allowed MIME types and extensions
const ALLOWED_MIME_TYPES = [
    'application/pdf',                   // .pdf
    'application/msword',                // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-powerpoint',     // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'application/vnd.ms-excel',          // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'text/plain',                        // .txt
    'text/csv',                          // .csv
    'application/zip',                   // .zip
];

// ❌ REMOVE: export const config = { ... }

/**
 * Helper function to process the file upload using formidable
 * @param {object} req - The Next.js request object
 */
export const uploadFile = (req) => {
  if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const form = formidable({ 
    uploadDir: uploadDir,
    keepExtensions: true, 
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
    
    // Custom unique and safe filename function
    filename: (name, ext, part) => {
        const originalName = part.originalFilename.split('.')[0].replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        return `${originalName}-${uniqueSuffix}${ext}`;
    },

    // File type validation function
    filter: ({ name, originalFilename, mimetype }) => {
        const isAllowed = ALLOWED_MIME_TYPES.includes(mimetype);
        
        if (!isAllowed) {
            console.warn(`File rejected: ${originalFilename} with type ${mimetype} is not a permitted document type.`);
        }
        
        return isAllowed;
    }
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      
      const fileKey = Object.keys(files)[0];
      const uploadedFile = fileKey ? files[fileKey][0] : null;

      // Check if the file was rejected by the filter
      if (!uploadedFile && fileKey) {
          return reject(new Error('The uploaded file type is not supported. Please upload PDF, DOCX, PPT, or other allowed document types.'));
      }

      // Resolve with the fields (text data) and the file object
      resolve({ fields, file: uploadedFile });
    });
  });
};