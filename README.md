# Streamline Learning and Assessment Platform (SLMS)

Welcome to the **Streamline Learning and Assessment Platform**, a comprehensive Learning Management System built for students, lecturers, and administrators to seamlessly manage academic workflows.

---

## 🚀 Application Workflow

To understand the core functionality and workflows of this application, below is a step-by-step breakdown of how the platform operates for each role:

### 1. **Authentication & Authorization**
- **Landing Page**: New or returning users land on the beautifully crafted main page detailing platform features (`/`).
- **Sign In / Sign Up**: Secure user login with `NextAuth.js`. Credentials are encrypted via `bcrypt` and verified against the backend MongoDB database.
- **Role-Based Routing**: Upon successful login, the system detects the user's role (`STUDENT`, `LECTURER`, or `ADMIN`) and seamlessly redirects them to their respective dashboards (`/dashboard`).

### 2. **Administrative Operations (Admins)**
- **User Management**: Admins can onboard new lecturers and handle existing accounts. This involves full CRUD operations over users.
- **Course Setup**: Admins create and structure courses within the institution, including titles, course codes, credit loads, and co-teaching assignments.
- **System Maintenance**: Full overview of metrics and operations across the platform to ensure data integrity.

### 3. **Academic Deliverables (Lecturers)**
- **Course Administration**: Lecturers view courses they are assigned to manage.
- **Content Delivery**: Uploading reading materials, lecture notes, and videos for student access.
- **Assessments**:
  - **Creating Assignments**: Define assignment titles, descriptions, point values, and strict due dates.
  - **Grading & Feedback**: Review submitted student work, assign grades, and leave constructive feedback.
- **Announcements & Messaging**: Push out direct course announcements or privately message students regarding their progress.

### 4. **Learning & submissions (Students)**
- **Enrollment**: Students interact with their dashboard to view available courses and enroll in them.
- **Resource Access**: Download and study materials provided by course lecturers.
- **Assignment Submissions**: Seamlessly upload files or insert rich text as answers to specific course assignments before the due date.
- **Grades & Progress Logging**: View real-time grades and read specific feedback given by lecturers to track academic progress.

---

## 🛠 Tech Stack and Architecture

- **Frontend**: Next.js (Pages Router) featuring fully responsive Tailwind CSS for rapid styling and swift UX.
- **Backend API**: Next.js API Routes structuring secure serverless functions.
- **Database**: **MongoDB**, optimizing rapid and scalable schemaless data reads/writes.
- **ORM**: Prisma for precise, strongly-typed schema mapping and intuitive querying.
- **Authentication**: NextAuth.js ensuring protected APIs, server-side rendered pages, and client-side routes.

## 📱 User Experience & Deployment
- The platform is designed with a **Mobile-First Approach**, leveraging fluid flexbox grids and responsive breakpoints ensuring accessibility on any device.
- Rendering has been optimized to deploy out-of-the-box on **Vercel** via `--turbopack` builds, assuring rapid Content Delivery and uncompromised UX swiftness.

### Getting Started

To spin up the platform locally:
1. Ensure `node` and `npm` are installed.
2. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
3. Set your internal `.env` configured exactly like the `.env.example`, particularly ensuring your MongoDB connection string is populated.
4. Push your schema to your DB:
   ```bash
   npm run db:init
   ```
5. Launch the fast development server:
   ```bash
   npm run dev
   ```

*(This application is maintained constantly. If you encounter bugs, review the `build_errors.txt` or start a new issue thread).*

---

## 📂 Modularized Directory Structure

The project has been refactored and modularized to guarantee a clean separation of concerns and faster Next.js turbopack builds:

```
src/
├── components/          # Reusable, stateless or generic UI components (Buttons, Modals, Navbars)
├── lib/                 # Shared utilities, file-handlers, database drivers.
├── pages/
│   ├── api/             # Next backend serverless functions, systematically routed.
│   ├── auth/            # Sign In / Sign Up endpoints handled dynamically by NextAuth.js
│   ├── dashboard/       # Core application interfaces, nested cleanly via role-based access:
│   │   ├── admin/       # Complete Admin Management pages (Courses, Lecturers)
│   │   ├── lecturer/    # Instructor Dashboard & grading operations
│   │   └── student/     # Student portal for consuming materials & completing assignments
│   └── index.js         # The Stunning Landing Page describing the Platform Workflows
```

This strict organization ensures that `pages/` only acts as routing while heavy frontend components stay inside `components/`. Duplicate or redundant pages in outer directories (e.g. `src/pages/admin`) have been aggressively cleaned and migrated into the primary single `dashboard/` workflow structure.
