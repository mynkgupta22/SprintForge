---
trigger: manual
---

Developer
🎯 Primary Goals:
View assigned tasks

Update task status

Participate in sprints

Add tasks (with permission)

Use natural language to log work

🔄 User Journey
2.1. Login
Same as Admin

Backend: POST /api/v1/auth/login

2.2. View Dashboard
Action: See assigned tasks & sprints

UI: My Dashboard

Backend:

GET /api/v1/tasks?assigneeUid=

GET /api/v1/sprints?memberUid=

2.3. Update Task
Action: Change status, comment

UI: Task Modal → Status Dropdown

Backend:

PATCH /api/v1/tasks/{id}

POST /api/v1/tasks/{id}/comments

2.4. Use AI Task Parser
Action: Enter natural language like:

“Fix login bug by tonight”

“Update UI for analytics module”

UI: Quick Add Input

Backend:

POST /api/v1/ai/parse-task → Confirmed JSON → POST /api/v1/tasks

2.5. Work in Sprint
Action: View sprint progress

Backend:

GET /api/v1/sprints/{id}

POST /api/v1/sprints/{id}/tasks
