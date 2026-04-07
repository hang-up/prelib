<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import TaskCard from "../components/tasks/TaskCard.vue";
import TaskCreateForm from "../components/tasks/TaskCreateForm.vue";
import TaskFilters from "../components/tasks/TaskFilters.vue";
import Button from "../components/ui/button/Button.vue";
import Card from "../components/ui/card/Card.vue";
import { useAuth } from "../composables/useAuth";
import { useTasks } from "../composables/useTasks";
import type { Task, TaskFilter, TaskStatus } from "../types/task";

const router = useRouter();
const { user, logout, isLoading: isAuthLoading } = useAuth();
const {
  tasks,
  statusFilter,
  isLoading,
  isCreating,
  loadError,
  createError,
  mutationError,
  loadTasks,
  setStatusFilter,
  createTask,
  updateTask,
  updateTaskStatus,
  isTaskMutating,
  clearMutationError,
} = useTasks();

const editingTaskId = ref<number | null>(null);
const createResetSignal = ref(0);
const myTasksOnly = ref(false);

const currentUserId = computed(() => user.value?.id ?? -1);
const currentUsername = computed(() => user.value?.username ?? "");
const sortedTasks = computed(() =>
  [...tasks.value].sort((a, b) => {
    const createdOrder = a.createdAt.localeCompare(b.createdAt);
    if (createdOrder !== 0) {
      return createdOrder;
    }

    return a.id - b.id;
  }),
);
const visibleTasks = computed(() =>
  myTasksOnly.value
    ? sortedTasks.value.filter((task) => task.owner.id === currentUserId.value)
    : sortedTasks.value,
);

const isOwner = (task: Task) => task.owner.id === currentUserId.value;

const updateFilter = async (filter: TaskFilter) => {
  editingTaskId.value = null;
  await setStatusFilter(filter);
};

const toggleMyTasksFilter = () => {
  editingTaskId.value = null;
  myTasksOnly.value = !myTasksOnly.value;
};

const submitCreateTask = async (input: {
  title: string;
  description: string | null;
  status: TaskStatus;
}) => {
  try {
    await createTask(input);
    createResetSignal.value += 1;
  } catch {
    // Error rendered from createError.
  }
};

const beginEditTask = (taskId: number) => {
  clearMutationError();
  editingTaskId.value = taskId;
};

const cancelTaskEdit = () => {
  editingTaskId.value = null;
  clearMutationError();
};

const submitTaskEdit = async (input: {
  taskId: number;
  title: string;
  description: string | null;
  status: TaskStatus;
}) => {
  try {
    await updateTask(input.taskId, {
      title: input.title,
      description: input.description,
      status: input.status,
    });
    if (editingTaskId.value === input.taskId) {
      cancelTaskEdit();
    }
  } catch {
    // Error rendered from mutationError.
  }
};

const onStatusSelect = async (input: { taskId: number; status: TaskStatus }) => {
  try {
    await updateTaskStatus(input.taskId, input.status);
  } catch {
    // Error rendered from mutationError.
  }
};

const handleLogout = async () => {
  await logout();
  await router.replace("/login");
};

onMounted(() => {
  void loadTasks(statusFilter.value);
});
</script>

<template>
  <main class="page-shell page-shell--tasks">
    <section class="task-workspace">
      <Card as="header" class="workspace-header workspace-panel">
        <div>
          <h1 class="page-title">Home</h1>
          <p class="eyebrow">Welcome, {{ currentUsername }}!</p>
        </div>

        <div>
          <Button type="button" variant="outline" :disabled="isAuthLoading" @click="handleLogout">
            {{ isAuthLoading ? "Signing out..." : "Sign out" }}
          </Button>
        </div>
      </Card>

      <section class="task-grid">
        <TaskCreateForm
          :is-creating="isCreating"
          :create-error="createError"
          :reset-signal="createResetSignal"
          @create="submitCreateTask"
        />

        <Card as="article" class="task-list-card workspace-panel">
          <div class="task-list-toolbar">
            <h2 class="section-title">Task list</h2>

            <TaskFilters
              :current-filter="statusFilter"
              :my-tasks-only="myTasksOnly"
              @change="updateFilter"
              @toggle-my-tasks="toggleMyTasksFilter"
            />
          </div>

          <p v-if="loadError" class="error-banner">
            {{ loadError }}
          </p>
          <p v-if="mutationError" class="error-banner">
            {{ mutationError }}
          </p>
          <p v-if="isLoading" class="muted-text">Loading tasks…</p>

          <ul v-if="!isLoading && visibleTasks.length > 0" class="task-list">
            <TaskCard
              v-for="task in visibleTasks"
              :key="task.id"
              :task="task"
              :can-edit="isOwner(task)"
              :is-editing="editingTaskId === task.id"
              :is-mutating="isTaskMutating(task.id)"
              @start-edit="beginEditTask"
              @cancel-edit="cancelTaskEdit"
              @save-edit="submitTaskEdit"
              @update-status="onStatusSelect"
            />
          </ul>

          <p v-if="!isLoading && visibleTasks.length === 0" class="empty-state">
            No tasks match this filter yet.
          </p>
        </Card>
      </section>
    </section>
  </main>
</template>

<style scoped>
.task-workspace {
  max-width: 1120px;
  margin: 0 auto;
  display: grid;
  gap: 16px;
}

.workspace-panel {
  padding: 24px;
}

.workspace-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.task-grid {
  display: grid;
  grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.task-list-toolbar {
  display: grid;
  gap: 12px;
  margin-bottom: 12px;
}

.section-title {
  margin: 0;
  font-size: 18px;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

.task-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
}

.muted-text {
  margin: 0;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.empty-state {
  margin: 8px 0 0;
  border: 1px dashed hsl(var(--border));
  border-radius: calc(var(--radius) - 2px);
  padding: 16px;
  text-align: center;
  font-size: 14px;
  color: hsl(var(--muted-foreground));
}

@media (max-width: 960px) {
  .task-grid {
    grid-template-columns: 1fr;
  }

  .workspace-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .workspace-panel {
    padding: 18px;
  }
}
</style>
