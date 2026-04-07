import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { backendConfig } from "../config";
import { seededTasks, seededUsers } from "./seed-data";
import { sqliteSchemaStatements } from "./schema";
import {
  databaseFilePath,
  getDatabase,
  initializeDatabaseClient,
} from "./client";

type UserRow = {
  id: number;
};

type CountRow = {
  count: number;
};

const seedDatabase = () => {
  const db = getDatabase();

  const insertUserStatement = db.prepare(
    `
      INSERT INTO users (username, password_hash)
      VALUES (?, ?)
      ON CONFLICT(username) DO NOTHING
    `,
  );
  const findUserIdByUsernameStatement = db.prepare(
    "SELECT id FROM users WHERE username = ?",
  );
  const countTasksStatement = db.prepare("SELECT COUNT(*) AS count FROM tasks");
  const insertTaskStatement = db.prepare(
    `
      INSERT INTO tasks (user_id, title, description, status)
      VALUES (@userId, @title, @description, @status)
    `,
  );

  const seedTransaction = db.transaction(() => {
    for (const user of seededUsers) {
      insertUserStatement.run(user.username, user.passwordHash);
    }

    const existingTaskCount = countTasksStatement.get() as CountRow | undefined;

    if ((existingTaskCount?.count ?? 0) > 0) {
      return;
    }

    for (const task of seededTasks) {
      const user = findUserIdByUsernameStatement.get(task.ownerUsername) as
        | UserRow
        | undefined;

      if (!user) {
        throw new Error(`Missing seeded user for task owner: ${task.ownerUsername}`);
      }

      insertTaskStatement.run({
        userId: user.id,
        title: task.title,
        description: task.description,
        status: task.status,
      });
    }
  });

  seedTransaction();
};

export const initializeDatabase = () => {
  const resolvedDatabasePath = resolve(process.cwd(), backendConfig.databasePath);

  mkdirSync(dirname(resolvedDatabasePath), { recursive: true });

  const db = initializeDatabaseClient(resolvedDatabasePath);

  db.pragma("foreign_keys = ON");

  for (const statement of sqliteSchemaStatements) {
    db.exec(statement);
  }

  seedDatabase();

  return databaseFilePath;
};
