// pages/lecturer/courses.js

import { withAuthGuard } from '../../components/AuthGuard';
import { UserRole } from '@prisma/client'; // Import the roles for clarity

function LecturerCourseManagement() {
  // This page is only visible to Lecturers
  return (
    <div>
      <h1>Lecturer Course Management</h1>
      <p>Create, edit, and manage your courses here.</p>
    </div>
  );
}

// Use the HOC and pass the allowed role(s)
export default withAuthGuard(LecturerCourseManagement, [UserRole.LECTURER, UserRole.ADMIN]);