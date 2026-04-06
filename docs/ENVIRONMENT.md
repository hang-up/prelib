# Environment Conventions

This repository uses a small set of shared environment variable names so local development and Docker Compose can point at the same application topology without renaming settings between environments.

## Local Setup

Copy the example files before running each workspace locally:

- `backend/.env.example` -> `backend/.env`
- `frontend/.env.example` -> `frontend/.env`
- `e2e/.env.example` -> `e2e/.env`

## Shared Variable Names

### Backend

- `HOST`: backend bind host. Keep `0.0.0.0` for local containers and local dev.
- `PORT`: backend HTTP port. Default: `4200`.
- `APP_ORIGIN`: browser-facing origin for the stack. Default local value: `http://localhost`.
- `DATABASE_PATH`: SQLite file path relative to the backend workspace. Default local value: `../db/data/task-tracker.sqlite`.
- `AUTH_COOKIE_NAME`: reserved auth cookie name for the upcoming seeded login flow.

### Frontend

- `FRONTEND_HOST`: Vite bind host. Default: `0.0.0.0`.
- `FRONTEND_PORT`: Vite dev/preview port. Default: `6384`.
- `VITE_APP_TITLE`: browser tab title for the frontend app.
- `VITE_API_BASE_URL`: frontend API base URL.

### End-to-End Tests

- `PLAYWRIGHT_BASE_URL`: public entrypoint used by Playwright. Default local value: `http://localhost`.

## Local Development Defaults

For direct workspace development without nginx:

- backend runs on `http://localhost:4200`
- frontend runs on `http://localhost:6384`
- `VITE_API_BASE_URL` should stay `http://localhost:4200/api`
- `PLAYWRIGHT_BASE_URL` should target the entrypoint under test, usually `http://localhost:6384` for direct frontend dev or `http://localhost` once nginx is introduced

## Docker Compose Conventions

Compose should keep the same variable names and only swap values where the network topology changes:

- keep `HOST=0.0.0.0` and `FRONTEND_HOST=0.0.0.0`
- mount persistent storage so `DATABASE_PATH` points at the SQLite file inside the backend container
- set `VITE_API_BASE_URL=/api` when the browser reaches the API through nginx
- set `PLAYWRIGHT_BASE_URL=http://localhost` when tests target the nginx entrypoint

Using the same names now keeps the later Compose files focused on service wiring instead of env translation.
