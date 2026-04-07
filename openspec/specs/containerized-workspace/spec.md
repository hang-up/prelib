# Purpose

Define the local container runtime expectations for the task tracker application.

## Requirements

### Requirement: The application runs through a single nginx entrypoint
The system SHALL provide a containerized local runtime where nginx serves as the single public entrypoint for the frontend, API, and admin utility routes.

#### Scenario: User opens the application entrypoint
- **WHEN** the local stack is started through Docker Compose
- **THEN** nginx serves the frontend application at the root path and proxies application traffic to the appropriate upstream services

#### Scenario: User accesses API and admin routes
- **WHEN** the local stack is running and a client requests `/api/` or `/adminer/`
- **THEN** nginx proxies those requests to the backend API and adminer services respectively

### Requirement: Application data persists across container restarts
The system SHALL persist SQLite-backed application data across container restarts in the local runtime.

#### Scenario: Restart stack after creating or editing data
- **WHEN** the local stack is stopped and restarted
- **THEN** previously created users and tasks remain available in the application

#### Scenario: First startup initializes demo data
- **WHEN** the local stack starts against an empty persistent data volume
- **THEN** the application initializes the SQLite database and inserts the seeded demo users and sample tasks
