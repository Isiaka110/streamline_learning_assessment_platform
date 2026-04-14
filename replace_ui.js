const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  // CSS classes
  { from: /btn-rect-primary/g, to: 'btn-primary' },
  { from: /btn-rect-outline/g, to: 'btn-outline' },
  // A generic button replacement might be risky, let's target specific ones
  { from: /className="btn-rect/g, to: 'className="px-4 py-2 rounded-xl font-bold transition-all text-sm' },
  { from: /glass/g, to: 'bg-white border-b border-border shadow-sm' }, // Replace 'glass' classes with soft white look

  // Terminology (Case sensitive where appropriate)
  { from: /Institutional /g, to: '' }, // remove vague "Institutional" altogether
  { from: /Module/g, to: 'Class' },
  { from: /module/g, to: 'class' },
  { from: /Modules/g, to: 'Classes' },
  { from: /modules/g, to: 'classes' },
  { from: /Lecturer/g, to: 'Teacher' },
  { from: /lecturer/g, to: 'teacher' },
  { from: /Lecturers/g, to: 'Teachers' },
  { from: /lecturers/g, to: 'teachers' },
  { from: /Faculty/g, to: 'Teacher' },
  { from: /faculty/g, to: 'teacher' },
  { from: /Assessments/g, to: 'Assignments' },
  { from: /Assessment/g, to: 'Assignment' },
  { from: /Resource Vault/g, to: 'Class Files' },
  { from: /Broadcasts/g, to: 'Messages' },
  { from: /Broadcast/g, to: 'Message' },
  { from: /Admin Console/g, to: 'Admin Dashboard' },
  { from: /Instructor Console/g, to: 'Teacher Dashboard' },
  { from: /Learner/g, to: 'Student' },
  { from: /learner/g, to: 'student' },
];

function processPath(currentPath) {
  const stats = fs.statSync(currentPath);
  if (stats.isDirectory()) {
    const files = fs.readdirSync(currentPath);
    files.forEach(file => {
      // Skip node_modules or .next if they were inside src, though they usually aren't
      processPath(path.join(currentPath, file));
    });
  } else if (stats.isFile() && (currentPath.endsWith('.js') || currentPath.endsWith('.jsx') || currentPath.endsWith('.ts') || currentPath.endsWith('.tsx'))) {
    let content = fs.readFileSync(currentPath, 'utf8');
    let originalContent = content;
    
    // Don't apply term replacements to pages/api routes as they might break JSON response keys expected by the frontend if we aren't careful, but since we are replacing "lecturer" -> "teacher", it could break API logic.
    // Wait, let's EXCLUDE the `pages/api` directory from terminology replacement BUT include for CSS replacement?
    // Actually, keeping the `pages/api` as is and only modifying components and non-api pages is much safer.
    const isApiRoute = currentPath.includes(path.join('pages', 'api'));
    
    if (isApiRoute) {
      // Just do CSS replacements if any exist there. (Mostly they don't, but just in case)
      let apiReplacements = [
        { from: /btn-rect-primary/g, to: 'btn-primary' },
        { from: /btn-rect-outline/g, to: 'btn-outline' },
        { from: /className="btn-rect/g, to: 'className="px-4 py-2 rounded-xl font-bold transition-all text-sm' }
      ]
      apiReplacements.forEach(r => content = content.replace(r.from, r.to));
    } else {
      replacements.forEach(r => {
        content = content.replace(r.from, r.to);
      });
      // Replace hard corners and 'glass' styles for containers
      content = content.replace(/border-2 border-foreground(\/10|\/5|\/20)?/g, 'border border-border rounded-2xl');
      content = content.replace(/border-t-4 border-foreground/g, 'border-t border-border');
      content = content.replace(/border-l-4 border-accent/g, 'border-l-4 border-primary rounded-l-xl');
    }

    if (content !== originalContent) {
      fs.writeFileSync(currentPath, content, 'utf8');
      console.log(`Updated ${currentPath}`);
    }
  }
}

processPath(srcDir);
console.log('Mass replacement complete.');
