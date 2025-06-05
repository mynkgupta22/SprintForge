# SprintForge

A modern Jira-like Kanban/Sprint management tool with powerful AI-driven features to enhance team productivity and sprint management.

## Live Demo

Access the live deployed application at: [https://sprintforge-app-v2.windsurf.build/](https://sprintforge-app-v2.windsurf.build/)

## Overview

SprintForge is a comprehensive sprint management solution that combines traditional Kanban board functionality with advanced AI capabilities to optimize sprint planning, execution, and retrospectives.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Java (JDK 17)
- Maven or Gradle
- PostgreSQL (with pgvector extension)

### Local Development

1. Clone the repository
   ```bash
   git clone https://github.com/mynkgupta22/SprintForge.git
   cd SprintForge
   ```

2. Install dependencies
   ```bash
   # Install frontend dependencies
   cd FRONTEND
   npm install
   ```

3. Set up the database
   - Install PostgreSQL if not already installed
   - Create a new PostgreSQL database
   - Enable the pgvector extension for RAG capabilities
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

4. Configure environment variables
   - Create an `application.properties` or `application.yml` file in the BACKEND/src/main/resources directory
   - Create a `.env` file in the FRONTEND directory
   - Configure database connection, API keys, and other environment variables

5. Start the development servers
   ```bash
   # Start backend server (using Maven)
   cd BACKEND
   ./mvnw spring-boot:run
   # OR using Gradle
   # ./gradlew bootRun
   
   # Start frontend development server
   cd ../FRONTEND
   npm start
   ```

5. Access the application at `http://localhost:5173`

## AI-Powered Features

### 1. Sprint Negotiator AI
Intelligently plans your sprints based on team capacity and priorities.
- Paste all upcoming tasks and click "Suggest Sprint Plan"
- AI analyzes task complexity, team availability, and priorities
- Generates a feasible sprint plan that balances workload and deadlines

### 2. Scope Creep Detector
Proactively identifies when sprint scope is expanding beyond initial commitments.
- Continuously monitors task additions and modifications
- Alerts team when scope growth exceeds predefined thresholds
- Provides recommendations to manage scope changes effectively

### 3. Risk Heatmap Generator
Visualizes potential bottlenecks and overallocations within your sprint.
- Analyzes task assignments across team members
- Highlights likely blockers based on dependencies and historical data
- Identifies team members with potentially overloaded schedules
- Suggests workload rebalancing to mitigate risks

### 4. Retrospective Generator
Creates comprehensive sprint retrospectives automatically.
- Analyzes sprint performance metrics, task completion rates, and delays
- Incorporates team logs and comments
- Generates structured retrospective reports highlighting:
  - What went well
  - Areas for improvement
  - Action items for the next sprint

## Technologies Used
- Frontend: React.js, Redux, Material UI
- Backend: Java Spring Boot
- Database: PostgreSQL with PG Vector for RAG (Retrieval Augmented Generation)
- AI Integration: Gemini API
