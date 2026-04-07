import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Task } from "../types/task";
import { useTasks } from "./useTasks";
import { tasksApi } from "../lib/api";

vi.mock("../lib/api", () => ({
  tasksApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

const mockedTasksApi = vi.mocked(tasksApi, { deep: true });

const sampleTasks: Task[] = [
  {
    id: 1,
    owner: { id: 1, username: "alice" },
    title: "Plan API route modules",
    description: "Split auth and task handlers.",
    status: "todo",
    createdAt: "2026-04-06T10:00:00.000Z",
    updatedAt: "2026-04-06T10:00:00.000Z",
  },
  {
    id: 2,
    owner: { id: 2, username: "bob" },
    title: "Verify nginx reverse proxy paths",
    description: "Confirm /api routing.",
    status: "done",
    createdAt: "2026-04-06T11:00:00.000Z",
    updatedAt: "2026-04-06T11:00:00.000Z",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useTasks composable", () => {
  it("loads tasks and tracks the active filter", async () => {
    mockedTasksApi.list.mockResolvedValueOnce({ tasks: sampleTasks });

    const tasks = useTasks();
    await tasks.loadTasks();

    expect(mockedTasksApi.list).toHaveBeenCalledWith(undefined);
    expect(tasks.tasks.value).toEqual(sampleTasks);
    expect(tasks.statusFilter.value).toBe("all");
    expect(tasks.loadError.value).toBeNull();
  });

  it("applies status filtering through the API", async () => {
    const doneTasks = sampleTasks.filter((task) => task.status === "done");
    mockedTasksApi.list.mockResolvedValueOnce({ tasks: doneTasks });

    const tasks = useTasks();
    await tasks.setStatusFilter("done");

    expect(mockedTasksApi.list).toHaveBeenCalledWith("done");
    expect(tasks.statusFilter.value).toBe("done");
    expect(tasks.tasks.value).toEqual(doneTasks);
  });

  it("creates a task and reloads using the current filter", async () => {
    const createdTask: Task = {
      id: 3,
      owner: { id: 1, username: "alice" },
      title: "Ship composable tests",
      description: null,
      status: "in-progress",
      createdAt: "2026-04-07T08:00:00.000Z",
      updatedAt: "2026-04-07T08:00:00.000Z",
    };

    mockedTasksApi.list.mockResolvedValueOnce({ tasks: [createdTask] });
    mockedTasksApi.create.mockResolvedValueOnce({ task: createdTask });
    mockedTasksApi.list.mockResolvedValueOnce({ tasks: [createdTask] });

    const tasks = useTasks();
    await tasks.setStatusFilter("in-progress");
    await tasks.createTask({
      title: "Ship composable tests",
      description: null,
      status: "in-progress",
    });

    expect(mockedTasksApi.create).toHaveBeenCalledWith({
      title: "Ship composable tests",
      description: null,
      status: "in-progress",
    });
    expect(mockedTasksApi.list).toHaveBeenLastCalledWith("in-progress");
    expect(tasks.isCreating.value).toBe(false);
    expect(tasks.createError.value).toBeNull();
  });

  it("updates a task and clears mutation tracking after refresh", async () => {
    mockedTasksApi.update.mockResolvedValueOnce({ task: sampleTasks[0] });
    mockedTasksApi.list.mockResolvedValueOnce({ tasks: sampleTasks });

    const tasks = useTasks();
    await tasks.updateTask(1, { title: "Plan API route modules (updated)" });

    expect(mockedTasksApi.update).toHaveBeenCalledWith(1, {
      title: "Plan API route modules (updated)",
    });
    expect(mockedTasksApi.list).toHaveBeenCalledWith(undefined);
    expect(tasks.isTaskMutating(1)).toBe(false);
    expect(tasks.mutationError.value).toBeNull();
  });

  it("surfaces mutation errors and still clears the mutating state", async () => {
    mockedTasksApi.updateStatus.mockRejectedValueOnce(
      new Error("Only the owner can update this task."),
    );

    const tasks = useTasks();

    await expect(tasks.updateTaskStatus(999, "done")).rejects.toThrow(
      "Only the owner can update this task.",
    );
    expect(tasks.mutationError.value).toBe("Only the owner can update this task.");
    expect(tasks.isTaskMutating(999)).toBe(false);
  });
});
