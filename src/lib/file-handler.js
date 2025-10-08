import * as fs from 'fs'; 
// ... (rest of the file-handler.js code) ...
// lib/file-handler.js

import formidable from 'formidable';
import path from 'path';

// Define the directory where uploaded files will be stored
const uploadDir = path.join(process.cwd(), 'public', 'submissions');

// Helper function to process the file upload
export const uploadFile = (req) => {
  // Ensure the public/submissions directory exists
  if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  // Set up formidable options
  const form = formidable({ 
    uploadDir: uploadDir,
    // Keep file extensions (e.g., .pdf, .docx)
    keepExtensions: true, 
    // Set a maximum file size (e.g., 5MB)
    maxFileSize: 5 * 1024 * 1024, 
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        // Handle file size limits, parsing errors, etc.
        return reject(err);
      }
      
      // We expect the file to be under the 'submissionFile' field
      const submissionFile = files.submissionFile ? files.submissionFile[0] : null;
      
      // Resolve with the fields (text data) and the file object
      resolve({ fields, file: submissionFile });
    });
  });
};

// Set the config to tell Next.js not to parse the body automatically
export const config = {
  api: {
    bodyParser: false,
  },
};