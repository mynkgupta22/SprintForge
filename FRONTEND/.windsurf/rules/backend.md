---
trigger: manual
---

# Backend Specification Document

---

## Project Overview

This backend is for a Jira-like Kanban and Sprint management tool that allows users to manage projects, tasks, sprints, and teams with role-based access control. The application is built using **Spring Boot** with **PostgreSQL** as the database.

---

## Technology Stack

- **Backend Framework:** Spring Boot (Java 17+ recommended)
- **Database:** PostgreSQL
- **ORM:** Spring Data JPA (Hibernate)
- **Authentication:** Spring Security with JWT tokens
- **Email Service:** SMTP for OTP and notifications
- **API Documentation:** Swagger / OpenAPI
- **Build Tool:** Maven or Gradle

---

## Functional Requirements

- User signup/login with email and password (OTP email verification on signup).
- Password reset via email.
- Role-based access with hardcoded roles: `ADMIN`, `PROJECT_MANAGER`, `DEVELOPER`.
- Role assignments are project-specific (user can have different roles per project).
- Project creation, with team member invitations by email.
- Backlog task creation per project.
- Sprint creation, with tasks assigned to sprints.
- Kanban board with fixed columns: Backlog, To Do, In Progress, Done.
- Task details include title, description, assignee, tags, priority, due date.
- Task comments support @mentions.
- Email notifications for task assignments and mentions.
- Activity log for task updates and comments.
- Weekly capacity tracking per user per sprint (auto-calculated).
- Sprint velocity and burndown charts.
- Private projects visible only to assigned team members.
- Fixed columns on Kanban board (non-customizable).
- Task filtering by tags, assignee, priority.

---

## Non-Functional Requirements

- Secure authentication and authorization.
- HTTPS enforced.
- Input validation and sanitation.
- Rate limiting on auth endpoints.
- Audit logging on sensitive actions.
- Method-level security.
- No support for OAuth or third-party login.
- No subtasks or customizable task types.
- No file attachments on comments.
- No downloadable reports.

---

## Database Schema

### Entities and Attributes

### 1. User

| Column        | Type      | Description              |
| ------------- | --------- | ------------------------ |
| id            | UUID (PK) | Unique identifier        |
| email         | VARCHAR   | User email (unique)      |
| password_hash | VARCHAR   | Hashed password (BCrypt) |
| full_name     | VARCHAR   | User’s full name         |
| is_verified   | BOOLEAN   | Email verified via OTP   |
| created_at    | TIMESTAMP | Timestamp of creation    |
| updated_at    | TIMESTAMP | Timestamp of last update |

---

### 2. Role

| Column | Type     | Description                |
| ------ | -------- | -------------------------- |
| id     | INT (PK) | Role ID                    |
| name   | VARCHAR  | Role name (ADMIN, PM, DEV) |

---

### 3. Project

| Column      | Type      | Description                 |
| ----------- | --------- | --------------------------- |
| id          | UUID (PK) | Unique identifier           |
| title       | VARCHAR   | Project name                |
| description | TEXT      | Project description         |
| created_by  | UUID (FK) | User ID who created project |
| visibility  | ENUM      | `PRIVATE` only              |
| created_at  | TIMESTAMP | Creation time               |
| updated_at  | TIMESTAMP | Last update time            |

---

### 4. UserProjectRole

| Column      | Type      | Description        |
| ----------- | --------- | ------------------ |
| id          | UUID (PK) | Unique identifier  |
| user_id     | UUID (FK) | User linked        |
| project_id  | UUID (FK) | Project linked     |
| role_id     | INT (FK)  | Role linked        |
| assigned_at | TIMESTAMP | When role assigned |

---

### 5. Task

| Column      | Type       | Description                               |
| ----------- | ---------- | ----------------------------------------- |
| id          | UUID (PK)  | Unique identifier                         |
| project_id  | UUID (FK)  | Linked project                            |
| title       | VARCHAR    | Task title                                |
| description | TEXT       | Task description                          |
| status      | ENUM       | One of: BACKLOG, TO_DO, IN_PROGRESS, DONE |
| assignee_id | UUID (FK)  | User assigned to task                     |
| priority    | ENUM       | LOW, MEDIUM, HIGH                         |
| due_date    | DATE       | Task due date                             |
| tags        | VARCHAR\[] | Array of tags                             |
| created_at  | TIMESTAMP  | Creation time                             |
| updated_at  | TIMESTAMP  | Last update time                          |

---

### 6. Sprint

| Column     | Type      | Description             |
| ---------- | --------- | ----------------------- |
| id         | UUID (PK) | Unique identifier       |
| project_id | UUID (FK) | Linked project          |
| name       | VARCHAR   | Sprint name             |
| start_date | DATE      | Set by creator          |
| end_date   | DATE      | Set by creator          |
| created_by | UUID (FK) | User who created sprint |
| created_at | TIMESTAMP | Creation time           |
| updated_at | TIMESTAMP | Last update time        |

---

### 7. SprintTask

| Column      | Type      | Description                  |
| ----------- | --------- | ---------------------------- |
| id          | UUID (PK) | Unique identifier            |
| sprint_id   | UUID (FK) | Linked sprint                |
| task_id     | UUID (FK) | Linked task                  |
| assigned_at | TIMESTAMP | When task assigned to sprint |

---

### 8. Commen

| Column  | Type      | Description       |
| ------- | --------- | ----------------- |
| id      | UUID (PK) | Unique identifier |
| task_id | UUID (FK) | Linked task       |

| us
