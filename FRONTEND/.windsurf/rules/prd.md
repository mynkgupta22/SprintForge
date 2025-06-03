---
trigger: manual
---

## 📘 Production Requirement Document (PRD)

**Project Name**: _Jira Clone - Sprint & Kanban Management Tool_
**Tech Stack**:

- **Frontend**: React (Vite preferred), Tailwind CSS
- **Backend**: Spring Boot (Java), PostgreSQL
- **Architecture**: Monolithic
- **Authentication**: Email + Password with OTP email verification
- **Deployment Target**: Web

---

### 🔐 1. Authentication & Authorization

#### Features:

- **Email-based signup and login** with OTP-based email verification
- **Password reset via email**
- **Hardcoded roles**: Admin, Project Manager (PM), Developer
- **Role-based access control (RBAC)** on all API endpoints
- **One user can have different roles in different projects**

---

### 🧑‍🤝‍🧑 2. User & Team Management

#### Team Invites:

- Users can **invite others via email** to their project
- Invite email contains a secure token link for signup/login and joining the team
- A user is **added directly to the team** on accepting the invite

---

### 📁 3. Project Management

- Users can **create private projects**
- Only invited team members can access the project
- A project must have:

  - Title
  - Description
  - Team Members with roles

---

### 🧩 4. Backlog & Sprint Management

#### Backlog:

- Each project has its own backlog
- Tasks do **not** support subtasks
- Task Types are **not customizable**
- Each task includes:

  - Title
  - Description
  - Assignee
  - Tags
  - Priority (Low, Medium, High, Critical)
  - Due Date

#### Sprint:

- Sprint is created by a PM/Admin
- Sprint creator sets start/end manually
- Tasks can be **moved from Backlog to Sprint**
- Sprint Board has **fixed columns**:

  - Backlog, To Do, In Progress, Done

- Supports **Sprint Velocity** and **Burndown Charts**

---

### 🗂️ 5. Kanban Board

- Fixed columns across all projects: Backlog, To Do, In Progress, Done
- Tasks can be dragged and dropped between columns
- **Filters**:

  - Tags
  - Assignees
  - Priority

---

### 📝 6. Task Collaboration

#### Comments:

- Users can add comments to tasks
- Supports **@mentions**
- **No file attachments**
- Email notification to assignee or mentioned users
- Audit log for each task showing:

  - Created/Updated by
  - Status changes
  - Comments with timestamps

---

### 📊 7. Capacity & Reporting

#### Capacity Management:

- Auto-calculated **per user per sprint**
- Uses completed task points (story points) as base

#### Dashboard:

- Real-time visual dashboard for:

  - Sprint progress
  - Task distribution
  - Team velocity

- **No CSV/Excel export**
- **No download reports**

---

### 📜 8. Activity Log

- Activity log shows only:

  - Task updates
  - Comments

- **Not** filterable
- **Not** exportable

---

### ⚙️ 9. Non-Functional Requirements

- **Monolithic Spring Boot app**
- Use Spring Security for RBAC
- Use PostgreSQL with proper indexing and foreign keys
- Ensure all actions are **tracked with timestamps and user attribution**
- Responsive UI with drag-and-drop support for Kanban board
- React UI must use clean modular components

---

### 🧠 10. AI/ML Integration (deferred)

- No AI-based sprint estimation, task suggestion, or retrospective generation at this point
