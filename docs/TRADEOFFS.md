# Tradeoffs

This app is optimized for a small local demo, not a production collaboration tool.

## Seeded Auth

- Uses two seeded users in SQLite:
  - `alice` / `password123`
  - `bob` / `password456`
- No sign up flow - login with seeded credentials to keep things simple.
- Tradeoff: credentials are fixed and this is not production-ready auth 

## Ownership Rules

- All authenticated users can view all tasks.
- Only the task owner can edit a task or update its status.
- Tradeoff: users can see each other's work but cannot jointly edit it

## Omitted Features

- No delete or archive flow (completed tasks are represented by `done` status).
- No audit history.
- No notifications.
- No search, pagination, or advanced filtering.
- No roles, assignment, or shared editing.
- No deployment design beyond local Docker Compose.
- No oauth, & IAM features.
- Chosen to keep scope focused on auth, task CRUD, ownership rules, and local runtime.

## Technical Cuts

- SQLite for simple local persistence.
- nginx as the single local entrypoint.
- e2e tests only for the happy path. NOTE: The setup assumes usage of nvm & node 22 installed. This hasn't been dockerized due to time constraints.
- Tradeoff: the stack is easy to run locally, but not designed for scale or complex team workflows.
