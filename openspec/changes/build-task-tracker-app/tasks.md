## 1. Project Scaffolding

- [ ] 1.1 Scaffold the Hono TypeScript backend, Vue 3 + Vite frontend, and Playwright/e2e workspace from the current empty directories.
- [ ] 1.2 Add project dependencies for Hono, `@hono/zod-openapi`, SQLite access, Vue, shadcn-vue, testing libraries, and supporting tooling.
- [ ] 1.3 Establish shared environment/config conventions for local development and Docker Compose.

## 2. Persistence And Seed Data

- [ ] 2.1 Define the SQLite schema for `users` and `tasks` with supported task statuses.
- [ ] 2.2 Implement database initialization and idempotent seed logic for two demo users and sample tasks.
- [ ] 2.3 Wire persistent SQLite storage into the backend and containerized runtime.

## 3. Backend API

- [ ] 3.1 Create modular auth routes, schemas, and middleware using `@hono/zod-openapi`.
- [ ] 3.2 Create modular task routes, schemas, and handlers for list, create, edit, and status update flows.
- [ ] 3.3 Enforce cross-user reads and owner-only writes consistently in backend authorization logic.
- [ ] 3.4 Expose OpenAPI documentation from the Hono application.

## 4. Frontend Experience

- [ ] 4.1 Implement the seeded login flow and authenticated app shell in Vue 3 + TypeScript.
- [ ] 4.2 Build the task workspace using shadcn-vue components and the design rules in `frontend/DESIGN.md`.
- [ ] 4.3 Add task creation, task editing, task status updates, and simple status filters in composable-driven UI flows.
- [ ] 4.4 Surface task ownership clearly so users can distinguish editable tasks from read-only tasks.

## 5. Local Runtime And Documentation

- [ ] 5.1 Configure nginx as the Docker entrypoint routing frontend, API, and adminer services.
- [ ] 5.2 Complete `docker-compose.yml` and `docker-compose.dist.yml` for the local development topology.
- [ ] 5.3 Add `docs/TRADEOFFS.md` describing the intentional cuts and the rationale behind seeded auth, ownership rules, and omitted features.

## 6. Verification

- [ ] 6.1 Add backend automated tests covering auth flows, validation, cross-user reads, and owner-only mutations.
- [ ] 6.2 Add frontend unit tests for composables handling auth, task retrieval, task filtering, and task mutations.
- [ ] 6.3 Add one Playwright happy-path workflow covering seeded login and a core task management flow if the stack remains stable enough for end-to-end coverage.
