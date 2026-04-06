## Context

This repository currently contains empty backend, frontend, and e2e application folders plus placeholder Docker files. The requested application is a fullstack task tracker built with a Hono TypeScript API using `@hono/zod-openapi`, a Vue 3 + TypeScript frontend through Vite, persistent SQLite storage, and Dockerized local runtime with nginx as the entrypoint.

The product scope is intentionally pragmatic:
- Authentication is hardcoded through seeded demo users rather than user self-registration.
- Tasks are visible across all users, which supports a simple shared board view.
- Task mutations are restricted to the authenticated owner because the system does not include audit logs or notifications.
- Delete, audit history, notifications, complex filters, pagination, roles, and shared-edit workflows are intentionally excluded and must be documented in `docs/TRADEOFFS.md`.

The design system in [frontend/DESIGN.md](/Users/robert.hang/Documents/webdev/personal/prelib/frontend/DESIGN.md) establishes a restrained shadcn-style UI with neutral colors, compact spacing, card-based layouts, and the task statuses `todo`, `in-progress`, and `done`.

## Goals / Non-Goals

**Goals:**
- Deliver a complete local fullstack task tracker with persistent data and demo-ready seed content.
- Keep the API modular and documented via `@hono/zod-openapi`, avoiding a giant `app.ts`.
- Preserve a simple but explicit authorization rule: everyone can read tasks, only owners can write tasks.
- Align the frontend with the existing design tokens and use shadcn-vue as the UI kit.
- Cover the critical application logic with backend tests, frontend composable tests, and one end-to-end happy path if practical.
- Make local startup predictable through Docker Compose with nginx acting as the single entrypoint.

**Non-Goals:**
- Self-service registration, password reset, OAuth, or role-based access control.
- Task deletion, archival workflows, notifications, or audit history.
- Advanced querying, search, pagination, or collaborative task assignment.
- Multi-environment deployment design beyond local containerized development.

## Decisions

### 1. Use seeded authentication instead of building account creation flows

The backend will store users in SQLite and seed two demo accounts with precomputed password hashes. The frontend will expose a login screen only, and the authenticated user identity will be used for all write authorization checks.

Why:
- It preserves real auth boundaries without spending time on registration, verification, or recovery flows.
- It keeps the data model future-friendly because authentication is still backed by a real `users` table.

Alternatives considered:
- Full username/password registration: closer to production behavior, but adds screens, validation, and more tests with limited demo value.
- Mock client-only auth: faster initially, but weakens backend authorization and makes ownership behavior less credible.

### 2. Model tasks with global read visibility and owner-scoped writes

Task listing endpoints will return tasks across all users, optionally filtered by status. Task create, edit, and status update operations will require an authenticated user and will only succeed when the target task belongs to that user.

Why:
- This matches the requested product rule and balances demo visibility with defensive write constraints.
- It simplifies the UI: the list can showcase multiple users’ seeded tasks while edit controls can be conditionally enabled for the current user.

Alternatives considered:
- Private per-user task lists: simpler authorization, but conflicts with the requested cross-user read behavior.
- Shared editing for all users: easier UI, but unsafe without audit or notification support.

### 3. Keep the domain model minimal and explicit in SQLite

The initial schema will include:
- `users(id, username, password_hash, created_at)`
- `tasks(id, user_id, title, description, status, created_at, updated_at)`

Task status will be constrained to `todo`, `in-progress`, and `done`. Deletion is intentionally omitted; completed work is represented by `done`.

Why:
- A small schema reduces migration and testing overhead.
- The status model aligns directly with the product request and design system.

Alternatives considered:
- Separate audit or status-history tables: valuable later, but unnecessary for the current scope.
- Soft-delete flag: adds branching and filtering without serving the current workflow.

### 4. Separate API concerns by feature with OpenAPI-first schemas

The backend will be organized into modular route files such as auth and tasks, with shared schema definitions and middleware. `@hono/zod-openapi` will define request/response contracts and expose built-in OpenAPI support for the API.

Why:
- It satisfies the modularization requirement and keeps the app maintainable as features grow.
- Shared zod schemas reduce drift between validation, handler logic, and documentation.

Alternatives considered:
- Single `app.ts` with inline routes: faster to start, but directly conflicts with the stated backend conventions.
- OpenAPI generation after the fact: increases the chance of drift between docs and runtime behavior.

### 5. Build the frontend around composables and a compact single-workspace UX

The Vue app will use composables for authentication, task querying, and filtering so the main business logic is testable without component tests. The primary experience will be a single authenticated task workspace with:
- status filter controls
- task list cards or rows
- create task form
- edit task flow
- clear affordances showing which tasks are editable by the current user

Why:
- Composables are the requested frontend testing boundary.
- A focused workspace fits the design system and keeps the app easy to demo.

Alternatives considered:
- Route-heavy UI with separate pages for create/edit/list: workable, but slower to build and less cohesive for a small app.
- Component-heavy state management: harder to test under the requested composable-only unit test approach.

### 6. Use nginx as the public entrypoint in Docker Compose

Docker Compose will orchestrate frontend, backend, nginx, and adminer. nginx will proxy:
- `/` to the frontend
- `/api/` to the backend
- `/adminer/` to adminer

It will also support frontend dev-serving patterns as needed by the chosen compose mode.

Why:
- nginx is explicitly required and gives a single stable entrypoint for the stack.
- It creates a realistic topology while keeping the application services isolated.

Alternatives considered:
- Exposing frontend and backend ports directly: simpler compose, but does not meet the nginx requirement.
- Serving built frontend assets directly from the API: reduces moving parts, but diverges from the requested topology and frontend tooling.

### 7. Prioritize targeted automated coverage over exhaustive UI tests

The backend test suite will cover auth, task listing, owner-only mutations, validation, and persistence behavior. Frontend unit tests will target composables only. A single Playwright happy path will validate the seeded login and a core task workflow if the implementation remains manageable.

Why:
- This matches the requested test mix and focuses effort on the highest-signal behaviors.
- It avoids component test churn for a UI that is primarily a thin layer over composables.

Alternatives considered:
- No Playwright: faster, but loses confidence in the integrated stack.
- Broad component testing: more brittle and outside the requested scope.

## Risks / Trade-offs

- [Global task visibility can surprise users] -> Make ownership explicit in the UI and in API docs so read vs write permissions are obvious.
- [Seeded authentication is less realistic than registration] -> Keep the data model compatible with future account flows and document the tradeoff in `docs/TRADEOFFS.md`.
- [nginx + dev servers add compose complexity] -> Keep routing paths minimal and align service names with the supplied nginx sample.
- [SQLite file handling in containers can become fragile] -> Use a clear mounted volume strategy and deterministic seed behavior.
- [Single-workspace UI can get crowded] -> Limit filters and actions to the essential flows and use the design system’s spacing/card conventions.
- [Happy-path Playwright could slow delivery] -> Treat it as the final validation layer after backend and composable tests are stable.

## Migration Plan

1. Scaffold backend, frontend, e2e, and docs structure from the empty placeholders.
2. Add SQLite schema creation, seed data, and persistent volume wiring.
3. Implement auth and task APIs with OpenAPI schemas and tests.
4. Implement the Vue workspace and composables aligned to the design system.
5. Wire Docker Compose and nginx routing for the local stack.
6. Add `docs/TRADEOFFS.md`, unit tests, and the optional Playwright happy path.

Rollback is straightforward during initial development because the change introduces a new application from scaffolded placeholders; reverting the change removes the app code and compose wiring without data migration concerns beyond deleting the local SQLite file.

## Open Questions

- Should unauthenticated users be redirected to login automatically at the frontend router level, or handled only by per-view guards?
- Should non-owner update attempts return `403` or `404`? The requested behavior implies owner-only writes, but the exact response code should be chosen consistently during implementation.
- Should the Playwright workflow run inside Docker Compose, against local dev servers, or both?
