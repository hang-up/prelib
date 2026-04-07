<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";

import Badge from "../../components/ui/badge/Badge.vue";
import Button from "../../components/ui/button/Button.vue";
import Card from "../../components/ui/card/Card.vue";
import Input from "../../components/ui/input/Input.vue";
import Label from "../../components/ui/label/Label.vue";
import Select from "../../components/ui/select/Select.vue";
import Textarea from "../../components/ui/textarea/Textarea.vue";
import { getTaskStatusLabel } from "../../lib/taskStatus";
import { TASK_STATUSES, type Task, type TaskStatus } from "../../types/task";

type TaskEditInput = {
  taskId: number;
  title: string;
  description: string | null;
  status: TaskStatus;
};

type TaskStatusUpdateInput = {
  taskId: number;
  status: TaskStatus;
};

type BadgeVariant = "default" | "secondary" | "outline" | "success" | "muted";

const props = defineProps<{
  task: Task;
  canEdit: boolean;
  isEditing: boolean;
  isMutating: boolean;
}>();

const emit = defineEmits<{
  startEdit: [taskId: number];
  cancelEdit: [];
  saveEdit: [payload: TaskEditInput];
  updateStatus: [payload: TaskStatusUpdateInput];
}>();

const editForm = reactive({
  title: "",
  description: "",
  status: "todo" as TaskStatus,
});

const editFormError = ref<string | null>(null);

const syncEditForm = () => {
  editForm.title = props.task.title;
  editForm.description = props.task.description ?? "";
  editForm.status = props.task.status;
};

watch(
  () => props.isEditing,
  (isEditing) => {
    if (isEditing) {
      syncEditForm();
      editFormError.value = null;
    }
  },
  { immediate: true },
);

watch(
  () => props.task,
  () => {
    if (props.isEditing) {
      syncEditForm();
    }
  },
  { deep: true },
);

const readOnlyTooltip = computed(
  () => `${props.task.owner.username} can edit this task`,
);

const formattedUpdatedAt = computed(() =>
  new Date(props.task.updatedAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }),
);

const statusBadgeVariant = computed<BadgeVariant>(() => {
  if (props.task.status === "todo") {
    return "secondary";
  }

  if (props.task.status === "done") {
    return "success";
  }

  return "default";
});

const submitTaskEdit = () => {
  editFormError.value = null;
  const title = editForm.title.trim();

  if (!title) {
    editFormError.value = "Task title is required.";
    return;
  }

  emit("saveEdit", {
    taskId: props.task.id,
    title,
    description: editForm.description.trim() || null,
    status: editForm.status,
  });
};

const onQuickStatusChange = (nextStatus: string) => {
  const status = nextStatus as TaskStatus;

  if (status === props.task.status) {
    return;
  }

  emit("updateStatus", {
    taskId: props.task.id,
    status,
  });
};
</script>

<template>
  <Card as="li" class="task-item" :class="{ 'task-item--readonly': !canEdit }">
    <div class="task-meta-stack">
      <div class="task-meta-top">
        <p class="task-owner-line">
          Owner:
          <strong>{{ task.owner.username }}</strong>
          <Badge
            v-if="!canEdit"
            variant="muted"
            class="task-owner-hint"
            :title="readOnlyTooltip"
          >
            Read-only
          </Badge>
        </p>

        <Button
          v-if="canEdit && !isEditing"
          type="button"
          variant="outline"
          size="sm"
          :disabled="isMutating"
          @click="emit('startEdit', task.id)"
        >
          Edit task
        </Button>
      </div>

      <div class="task-title-row">
        <h3 class="task-title">{{ task.title }}</h3>
        <Badge :variant="statusBadgeVariant">
          {{ getTaskStatusLabel(task.status) }}
        </Badge>
      </div>

      <p class="task-updated-at">Updated {{ formattedUpdatedAt }}</p>
    </div>

    <template v-if="isEditing">
      <form class="form-stack task-edit-form" @submit.prevent="submitTaskEdit">
        <Label :for="`edit-title-${task.id}`">Title</Label>
        <Input
          :id="`edit-title-${task.id}`"
          v-model="editForm.title"
          maxlength="120"
          required
        />

        <Label :for="`edit-description-${task.id}`">Description</Label>
        <Textarea
          :id="`edit-description-${task.id}`"
          v-model="editForm.description"
          rows="3"
        />

        <Label :for="`edit-status-${task.id}`">Status</Label>
        <Select :id="`edit-status-${task.id}`" v-model="editForm.status">
          <option v-for="status in TASK_STATUSES" :key="status" :value="status">
            {{ getTaskStatusLabel(status) }}
          </option>
        </Select>

        <p v-if="editFormError" class="error-banner">
          {{ editFormError }}
        </p>

        <div class="task-inline-actions task-inline-actions--right">
          <Button type="submit" :disabled="isMutating">
            {{ isMutating ? "Saving..." : "Save changes" }}
          </Button>
          <Button type="button" variant="ghost" :disabled="isMutating" @click="emit('cancelEdit')">
            Cancel
          </Button>
        </div>
      </form>
    </template>
    <template v-else>
      <p class="task-description">
        {{ task.description || "No description provided." }}
      </p>

      <div v-if="canEdit" class="task-inline-actions task-inline-actions--right">
        <Label class="task-inline-label" :for="`status-${task.id}`">Quick status</Label>
        <Select
          :id="`status-${task.id}`"
          class="task-inline-status"
          :model-value="task.status"
          :disabled="isMutating"
          @update:model-value="onQuickStatusChange"
        >
          <option v-for="status in TASK_STATUSES" :key="status" :value="status">
            {{ getTaskStatusLabel(status) }}
          </option>
        </Select>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.task-item {
  padding: 14px;
}

.task-item--readonly {
  background: hsl(var(--secondary) / 0.35);
}

.task-meta-stack {
  display: grid;
  gap: 8px;
  margin-bottom: 10px;
}

.task-meta-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.task-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.task-title {
  margin: 0;
  font-size: 16px;
  line-height: 1.3;
}

.task-owner-line {
  margin: 0;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.task-owner-hint {
  cursor: help;
}

.task-description {
  margin: 0 0 8px;
  font-size: 14px;
  color: hsl(var(--foreground));
  line-height: 1.5;
}

.task-updated-at {
  margin: 0;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.task-inline-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.task-inline-actions--right {
  justify-content: flex-end;
}

.task-inline-label {
  margin: 0;
}

.task-inline-status {
  width: auto;
  min-width: 146px;
}

.task-edit-form {
  margin-top: 8px;
}

@media (max-width: 640px) {
  .task-meta-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .task-title-row {
    gap: 8px;
  }

  .task-inline-actions--right {
    justify-content: flex-start;
  }
}
</style>
