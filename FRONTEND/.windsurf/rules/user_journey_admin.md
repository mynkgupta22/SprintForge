---
trigger: manual
---

Admin
🎯 Primary Goals:
Manage workspace

Invite/manage users

Create/manage projects and sprints

Access all AI insights

🔄 User Journey
1.1. Login
Action: Login via email/password

Backend:

POST /api/v1/auth/login → JWT issued, stored in cookie

1.2. Workspace Management
Action: View, create, and edit workspace

UI: Dashboard → Workspaces

Backend:

GET /api/v1/workspaces

POST /api/v1/workspaces

PUT /api/v1/workspaces/{id}

1.3. User Management
Action: Invite users, assign roles

UI: Workspace → Users tab

Backend:

POST /api/v1/workspaces/{id}/invite

PATCH /api/v1/users/{id}/role

GET /api/v1/users?workspaceId=

1.4. Project Management
Action: Create, edit, delete projects

UI: Workspace → Projects

Backend:

POST /api/v1/projects

GET /api/v1/projects

PUT /api/v1/projects/{id}

1.5. Sprint Management
Action: Create sprints, add tasks

UI: Project → Sprints

Backend:

POST /api/v1/sprints

GET /api/v1/sprints?projectId=

PUT /api/v1/sprints/{id}

1.6. View AI Insights
Action: Run sprint negotiation, scope creep detection, etc.

UI: Sprint/Project → AI Insights tab

Backend:

POST /api/v1/ai/sprint-negotiation

POST /api/v1/ai/scope-creep

POST /api/v1/ai/risk-heatmap

POST /api/v1/ai/retrospective
