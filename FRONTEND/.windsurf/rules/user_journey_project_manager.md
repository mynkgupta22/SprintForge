---
trigger: manual
---

Project Manager (PM)
🎯 Responsibilities:
Create & manage projects

Handle backlog, sprints, and team

Assign tasks

Monitor progress

Use AI tools (optional)

No global admin access (unless also Admin)

🔄 User Journey
3.1. Create Project
Action: Create new project

UI: Dashboard → "Create Project"

Backend:

POST /api/v1/projects

PM becomes createdByUserId

3.2. Invite Team Members
UI: Project → Team → “Invite Member”

Backend:

POST /api/v1/projects/{projectId}/invite

3.3. Add Backlog Items
Action: Add tasks/stories

UI: Project → Backlog

Backend:

POST /api/v1/tasks (with projectId, status=BACKLOG)

3.4. Manage Sprints
UI: Sprints tab → "Start Sprint"

Backend:

POST /api/v1/sprints

PATCH /api/v1/tasks/{id} (move task to sprint)

3.5. Assign Tasks
UI: Task card → Assignee dropdown

Backend:

PATCH /api/v1/tasks/{id}

3.6. Monitor Kanban Board
UI: Kanban board (drag & drop tasks)

Backend:

GET /api/v1/tasks?projectId=

PATCH /api/v1/tasks/{id} (on status update)

3.7. Manage Capacity
UI: Sprint → Capacity tab

Backend:

GET /api/v1/sprints/{id}/capacity

3.8. Sprint Reports
UI: Sprint Dashboard

Backend:

GET /api/v1/sprints/{id}/report

3.9. Collaborate
UI: Task → Comments section

Backend:

POST /api/v1/tasks/{id}/comments

3.10. View Activity Logs
UI: Task → Activity tab

Backend:

GET /api/v1/tasks/{id}/logs

3.11. Notifications
Trigger: PM is assigned or mentioned

Backend:

Notification system → background SMTP/Queue

3.12. Use AI Tools (optional)
UI: Sprint → AI Insights

Backend:

POST /api/v1/ai/sprint-negotiation

POST /api/v1/ai/scope-creep

POST /api/v1/ai/risk-heatmap

POST /api/v1/ai/retrospective
