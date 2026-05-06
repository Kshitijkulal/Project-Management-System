TEAM TASK MANAGER

A full-stack task management app for small teams. You create projects,
add members with roles, assign tasks, and track progress. That is
basically it.

Built this as a project to learn and demonstrate a working
full-stack system with real auth, role-based permissions, and
a clean separation between frontend and backend.


TECH STACK

Frontend:
  - Next.js 16 (App Router)
  - React 19
  - Tailwind CSS 4
  - react-hot-toast for notifications

Backend:
  - Node.js with Express 5
  - Prisma 5 (ORM)
  - MongoDB (database)
  - JWT for auth tokens
  - bcrypt for password hashing
  - nodemailer for OTP emails


HOW TO RUN LOCALLY

Prerequisites:
  - Node.js installed
  - A MongoDB instance (local or Atlas)
  - An SMTP email account (Gmail works fine)

1. Clone the repo

2. Backend setup

   cd server
   npm install
   npx prisma generate
   npm run dev

   The server runs on http://localhost:8080 by default.

3. Frontend setup

   cd client
   npm install
   npm run dev

   The frontend runs on http://localhost:3000 by default.

4. Environment variables

   Server (server/.env):

     DATABASE_URL=<your mongodb connection string>
     PORT=8080
     JWT_SECRET=<any random string>
     SMTP_HOST=smtp.gmail.com
     SMTP_USER=<your email>
     SMTP_PASS=<your app password>
     SMTP_PORT=587

   Client (client/.env.local):

     NEXT_PUBLIC_API_URL=http://localhost:8080/api

5. Seed data

   cd server
   npx prisma db seed

   This wipes the database and creates 5 test users, 1 project,
   and 5 tasks with various statuses. See the test credentials
   section below.


FEATURES


Authentication:
  - Signup requires email OTP verification first, then you set
    a password and name
  - Login is email + password, returns a JWT token
  - Password reset works through OTP as well
  - OTP is sent via email using nodemailer
  - Tokens expire after 1 day

Role-Based Access Control:
  - Three roles: OWNER, ADMIN, MEMBER
  - OWNER has all permissions. Can add/remove members, change
    roles, create tasks, assign tasks, and do everything else
  - ADMIN can add members, create tasks, assign tasks, and
    update tasks. Cannot remove members or change roles
  - MEMBER can only update tasks assigned to them and view
    the project
  - Permissions are checked on every protected action

Project Management:
  - Create projects. The creator automatically becomes OWNER
  - Add members to a project by user ID
  - Remove members (owner only)
  - Change member roles between ADMIN and MEMBER (owner only)
  - Users only see projects they are a member of
  - Soft delete support on projects

Task Management:
  - Create tasks with title, description, assignee, and due date
  - Task lifecycle: TODO -> IN_PROGRESS -> DONE
  - Start a task (moves from TODO to IN_PROGRESS)
  - Complete a task (moves from IN_PROGRESS to DONE)
  - Reopen a task (moves back to TODO)
  - Reassign tasks to other project members
  - Bulk status updates on multiple tasks at once
  - Soft delete on tasks
  - Filter tasks by status or overdue flag
  - Task summary endpoint with counts by status and overdue

Dashboard:
  - Project-level dashboard showing task breakdown (todo, in
    progress, done, overdue) and per-user stats
  - Global dashboard aggregating stats across all projects
    the user belongs to


DESIGN DECISIONS


Why RBAC is done this way:
  Permissions are stored as a static map in the codebase, not in
  the database. Each role maps to a list of allowed actions. The
  checkPermission utility looks up the role and throws a 403 if
  the action is not in the list. This keeps it simple. There is
  no need for a full ACL system for three roles. The tradeoff is
  that adding new roles means changing code, but for this project
  that is fine.

Why a monorepo:
  The client and server live in the same repo but are completely
  independent. No shared dependencies, no workspace tooling, no
  turborepo. They are just two folders. This keeps deployment
  simple since you can point Railway at server/ and Vercel at
  client/ without any build pipeline complexity.

Why simple UI:
  The frontend is intentionally minimal. The focus of this project
  was on the backend logic, API design, and role-based access. The
  UI does what it needs to do. Forms work, data shows up, errors
  are handled. It is not trying to be a design showcase.

OTP storage:
  OTPs are stored in an in-memory Map on the server, not in the
  database. This means they do not survive a server restart. For
  a production system you would use Redis or store them in the
  database with an expiry. For this project, the in-memory
  approach keeps things simple and avoids extra infrastructure.

Soft deletes:
  Projects and tasks use a deletedAt field instead of actual
  deletion. Queries filter out soft-deleted records. This is a
  common pattern to avoid losing data and to support potential
  undo or audit features later.


KNOWN LIMITATIONS


- OTPs are stored in memory. If the server restarts, all pending
  OTPs are lost. Not suitable for production as-is.

- No refresh token mechanism. The JWT expires after 1 day and the
  user has to log in again. There is no silent refresh.

- No input validation library. Validation is done manually with
  if-checks in the service layer. Something like Zod or Joi would
  be better for a production app.

- No pagination on any endpoint. If a project has hundreds of
  tasks, the API returns all of them in one response.

- No test suite. There are no unit tests or integration tests.

- The frontend does not have proper loading states everywhere.
  Some pages might feel unresponsive while data is being fetched.

- No file uploads or attachments on tasks.

- No real-time updates. If someone else changes a task, you need
  to refresh the page to see it.

- CORS is wide open (using cors() with no config). Should be
  locked down for production.

- Error messages from the backend are sometimes too generic.


TEST CREDENTIALS


All seeded users share the same password: password123

  Email               Name            Role in "Core Project"

  owner@test.com      Owner User      OWNER
  admin@test.com      Admin User      ADMIN
  member1@test.com    Member One      MEMBER
  member2@test.com    Member Two      MEMBER
  outsider@test.com   Outsider User   (not in any project)

The seed script also creates a project called "Core Project"
with 5 tasks in various states (TODO, IN_PROGRESS, DONE) and
with different due dates.
