import type { TaskFilter, TaskStatus } from "../types/task";

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Todo",
  "in-progress": "In progress",
  done: "Done",
};

export const TASK_FILTER_OPTIONS: Array<{ value: TaskFilter; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "todo", label: TASK_STATUS_LABELS.todo },
  { value: "in-progress", label: TASK_STATUS_LABELS["in-progress"] },
  { value: "done", label: TASK_STATUS_LABELS.done },
];

export const getTaskStatusLabel = (status: TaskStatus) => TASK_STATUS_LABELS[status];

