import { TASK_STATUSES } from "../constants";

export type TaskStatus = (typeof TASK_STATUSES)[number];

const quotedTaskStatuses = TASK_STATUSES.map((status) => `'${status}'`).join(", ");

export const createUsersTableSql = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;

export const createTasksTableSql = `
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN (${quotedTaskStatuses})),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
  );
`;

export const createTaskIndexesSql = [
  "CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);",
  "CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);",
] as const;

export const sqliteSchemaStatements = [
  createUsersTableSql,
  createTasksTableSql,
  ...createTaskIndexesSql,
] as const;
