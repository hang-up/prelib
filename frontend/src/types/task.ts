export const TASK_STATUSES = ["todo", "in-progress", "done"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskFilter = TaskStatus | "all";

export type AuthUser = {
  id: number;
  username: string;
};

export type Task = {
  id: number;
  owner: AuthUser;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

