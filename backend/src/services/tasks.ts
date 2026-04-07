import { TASK_STATUSES } from "../lib/constants";
import { getDatabase } from "../lib/db";

type TaskRow = {
  id: number;
  user_id: number;
  username: string;
  title: string;
  description: string | null;
  status: (typeof TASK_STATUSES)[number];
  created_at: string;
  updated_at: string;
};

type TaskOwnerRow = {
  user_id: number;
};

export type TaskView = {
  id: number;
  owner: {
    id: number;
    username: string;
  };
  title: string;
  description: string | null;
  status: (typeof TASK_STATUSES)[number];
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskInput = {
  title: string;
  description?: string | null;
  status: (typeof TASK_STATUSES)[number];
};

export type UpdateTaskInput = {
  title?: string;
  description?: string | null;
  status?: (typeof TASK_STATUSES)[number];
};

type TaskServiceStatements = {
  listAllTasks: ReturnType<ReturnType<typeof getDatabase>["prepare"]>;
  listTasksByStatus: ReturnType<ReturnType<typeof getDatabase>["prepare"]>;
  selectTaskById: ReturnType<ReturnType<typeof getDatabase>["prepare"]>;
  selectTaskOwnerById: ReturnType<ReturnType<typeof getDatabase>["prepare"]>;
  insertTask: ReturnType<ReturnType<typeof getDatabase>["prepare"]>;
  updateTask: ReturnType<ReturnType<typeof getDatabase>["prepare"]>;
  updateTaskStatus: ReturnType<ReturnType<typeof getDatabase>["prepare"]>;
};

let preparedStatements: TaskServiceStatements | null = null;
let preparedDatabase: ReturnType<typeof getDatabase> | null = null;

const selectTaskSql = `
  SELECT
    tasks.id,
    tasks.user_id,
    users.username,
    tasks.title,
    tasks.description,
    tasks.status,
    tasks.created_at,
    tasks.updated_at
  FROM tasks
  INNER JOIN users ON users.id = tasks.user_id
`;

const getPreparedStatements = (): TaskServiceStatements => {
  const db = getDatabase();

  if (preparedStatements && preparedDatabase === db) {
    return preparedStatements;
  }

  preparedDatabase = db;
  preparedStatements = {
    listAllTasks: db.prepare(
      `
      ${selectTaskSql}
      ORDER BY tasks.updated_at DESC, tasks.id DESC
      `,
    ),
    listTasksByStatus: db.prepare(
      `
      ${selectTaskSql}
      WHERE tasks.status = ?
      ORDER BY tasks.updated_at DESC, tasks.id DESC
      `,
    ),
    selectTaskById: db.prepare(
      `
      ${selectTaskSql}
      WHERE tasks.id = ?
      `,
    ),
    selectTaskOwnerById: db.prepare("SELECT user_id FROM tasks WHERE id = ?"),
    insertTask: db.prepare(
      `
      INSERT INTO tasks (user_id, title, description, status)
      VALUES (?, ?, ?, ?)
      `,
    ),
    updateTask: db.prepare(
      `
      UPDATE tasks
      SET
        title = ?,
        description = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
    ),
    updateTaskStatus: db.prepare(
      `
      UPDATE tasks
      SET
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
    ),
  };

  return preparedStatements;
};

const mapTaskRow = (row: TaskRow): TaskView => ({
  id: row.id,
  owner: {
    id: row.user_id,
    username: row.username,
  },
  title: row.title,
  description: row.description,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const getTaskRowById = (taskId: number): TaskRow | null => {
  const { selectTaskById } = getPreparedStatements();
  const row = selectTaskById.get(taskId) as TaskRow | undefined;
  return row ?? null;
};

const getTaskOwnerById = (taskId: number): TaskOwnerRow | null => {
  const { selectTaskOwnerById } = getPreparedStatements();
  const row = selectTaskOwnerById.get(taskId) as TaskOwnerRow | undefined;
  return row ?? null;
};

const ensureOwner = (
  taskId: number,
  userId: number,
): { kind: "ok" } | { kind: "not_found" } | { kind: "forbidden" } => {
  const owner = getTaskOwnerById(taskId);

  if (!owner) {
    return { kind: "not_found" };
  }

  if (owner.user_id !== userId) {
    return { kind: "forbidden" };
  }

  return { kind: "ok" };
};

export const listTasks = (
  status?: (typeof TASK_STATUSES)[number],
): TaskView[] => {
  const { listAllTasks, listTasksByStatus } = getPreparedStatements();
  const rows = (status
    ? listTasksByStatus.all(status)
    : listAllTasks.all()) as TaskRow[];

  return rows.map(mapTaskRow);
};

export const createTask = (
  userId: number,
  input: CreateTaskInput,
): TaskView => {
  const { insertTask } = getPreparedStatements();
  const insertResult = insertTask.run(
    userId,
    input.title,
    input.description ?? null,
    input.status,
  );
  const createdTaskId = Number(insertResult.lastInsertRowid);
  const createdTask = getTaskRowById(createdTaskId);

  if (!createdTask) {
    throw new Error("Task creation failed unexpectedly.");
  }

  return mapTaskRow(createdTask);
};

export const updateTask = (
  userId: number,
  taskId: number,
  input: UpdateTaskInput,
): { kind: "ok"; task: TaskView } | { kind: "not_found" } | { kind: "forbidden" } => {
  const ownership = ensureOwner(taskId, userId);

  if (ownership.kind !== "ok") {
    return ownership;
  }

  const currentTask = getTaskRowById(taskId);
  if (!currentTask) {
    return { kind: "not_found" };
  }

  const { updateTask: updateTaskStatement } = getPreparedStatements();
  updateTaskStatement.run(
    input.title ?? currentTask.title,
    input.description !== undefined ? input.description : currentTask.description,
    input.status ?? currentTask.status,
    taskId,
  );

  const updatedTask = getTaskRowById(taskId);
  if (!updatedTask) {
    return { kind: "not_found" };
  }

  return {
    kind: "ok",
    task: mapTaskRow(updatedTask),
  };
};

export const updateTaskStatus = (
  userId: number,
  taskId: number,
  status: (typeof TASK_STATUSES)[number],
): { kind: "ok"; task: TaskView } | { kind: "not_found" } | { kind: "forbidden" } => {
  const ownership = ensureOwner(taskId, userId);

  if (ownership.kind !== "ok") {
    return ownership;
  }

  const { updateTaskStatus: updateTaskStatusStatement } = getPreparedStatements();
  updateTaskStatusStatement.run(status, taskId);

  const updatedTask = getTaskRowById(taskId);
  if (!updatedTask) {
    return { kind: "not_found" };
  }

  return {
    kind: "ok",
    task: mapTaskRow(updatedTask),
  };
};
