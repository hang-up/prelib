## Why

The repository is scaffolded but does not yet provide the requested task tracker experience across backend, frontend, persistence, testing, and local runtime. This change defines the end-to-end product contract so implementation can deliver a coherent demo-ready application instead of a disconnected set of partial features.

## What Changes

- Add seeded username/password authentication backed by a persistent SQLite `users` table, with two demo users available for login.
- Add task tracking capabilities that support creating tasks, viewing all tasks across users, editing task details, updating task status, and filtering tasks by status.
- Enforce ownership-aware writes so authenticated users can only modify tasks they own, while allowing task reads across all users.
- Define a Docker-based local runtime with nginx as the entrypoint in front of the Vue frontend, Hono API, and supporting services.
- Require backend automated tests, frontend composable unit tests, and one Playwright happy-path workflow when feasible.
- Add `docs/TRADEOFFS.md` documenting intentional product and technical scope cuts.

## Capabilities

### New Capabilities
- `seeded-user-auth`: Demo authentication using seeded users, login/logout flows, and authenticated identity for downstream authorization.
- `task-tracking`: Task creation, cross-user task listing, status filtering, owner-scoped edits, and status updates.
- `containerized-workspace`: Containerized local runtime with nginx entrypoint routing frontend, API, and admin utilities.

### Modified Capabilities
- None.

## Impact

- Affects new backend modules for auth, task APIs, persistence, seeding, and tests under `backend/`.
- Affects new Vue frontend screens, composables, and test setup under `frontend/`.
- Adds SQLite database files and seed strategy under `db/`.
- Requires nginx and Docker compose configuration in `nginx/`, `docker-compose.yml`, and `docker-compose.dist.yml`.
- Adds project documentation in `docs/TRADEOFFS.md`.
