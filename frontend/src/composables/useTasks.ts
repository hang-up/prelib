import { readonly, ref } from "vue";

import { tasksApi } from "../lib/api";
import type { Task, TaskFilter, TaskStatus } from "../types/task";

type CreateTaskInput = {
  title: string;
  description?: string | null;
  status: TaskStatus;
};

type UpdateTaskInput = {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
};

const toErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message.trim().length > 0
    ? error.message
    : fallback;

export const useTasks = () => {
  const tasks = ref<Task[]>([]);
  const statusFilter = ref<TaskFilter>("all");
  const isLoading = ref(false);
  const isCreating = ref(false);
  const loadError = ref<string | null>(null);
  const createError = ref<string | null>(null);
  const mutationError = ref<string | null>(null);
  const mutatingTaskIds = ref<Record<number, boolean>>({});

  const setTaskMutating = (taskId: number, isMutating: boolean) => {
    if (isMutating) {
      mutatingTaskIds.value = { ...mutatingTaskIds.value, [taskId]: true };
      return;
    }

    const { [taskId]: removedTaskId, ...rest } = mutatingTaskIds.value;
    void removedTaskId;
    mutatingTaskIds.value = rest;
  };

  const loadTasks = async (nextFilter: TaskFilter = statusFilter.value) => {
    statusFilter.value = nextFilter;
    isLoading.value = true;
    loadError.value = null;

    try {
      const response = await tasksApi.list(
        nextFilter === "all" ? undefined : nextFilter,
      );
      tasks.value = response.tasks;
    } catch (error) {
      loadError.value = toErrorMessage(error, "Unable to load tasks right now.");
    } finally {
      isLoading.value = false;
    }
  };

  const setStatusFilter = async (nextFilter: TaskFilter) => {
    await loadTasks(nextFilter);
  };

  const createTask = async (input: CreateTaskInput) => {
    isCreating.value = true;
    createError.value = null;

    try {
      await tasksApi.create(input);
      await loadTasks(statusFilter.value);
    } catch (error) {
      createError.value = toErrorMessage(
        error,
        "Unable to create this task right now.",
      );
      throw error;
    } finally {
      isCreating.value = false;
    }
  };

  const updateTask = async (taskId: number, input: UpdateTaskInput) => {
    mutationError.value = null;
    setTaskMutating(taskId, true);

    try {
      await tasksApi.update(taskId, input);
      await loadTasks(statusFilter.value);
    } catch (error) {
      mutationError.value = toErrorMessage(
        error,
        "Unable to update this task right now.",
      );
      throw error;
    } finally {
      setTaskMutating(taskId, false);
    }
  };

  const updateTaskStatus = async (taskId: number, status: TaskStatus) => {
    mutationError.value = null;
    setTaskMutating(taskId, true);

    try {
      await tasksApi.updateStatus(taskId, status);
      await loadTasks(statusFilter.value);
    } catch (error) {
      mutationError.value = toErrorMessage(
        error,
        "Unable to update task status right now.",
      );
      throw error;
    } finally {
      setTaskMutating(taskId, false);
    }
  };

  const isTaskMutating = (taskId: number) => Boolean(mutatingTaskIds.value[taskId]);

  const clearMutationError = () => {
    mutationError.value = null;
  };

  return {
    tasks: readonly(tasks),
    statusFilter: readonly(statusFilter),
    isLoading: readonly(isLoading),
    isCreating: readonly(isCreating),
    loadError: readonly(loadError),
    createError: readonly(createError),
    mutationError: readonly(mutationError),
    loadTasks,
    setStatusFilter,
    createTask,
    updateTask,
    updateTaskStatus,
    isTaskMutating,
    clearMutationError,
  };
};

