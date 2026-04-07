<script setup lang="ts">
import { reactive, ref, watch } from "vue";

import Button from "../../components/ui/button/Button.vue";
import Card from "../../components/ui/card/Card.vue";
import Input from "../../components/ui/input/Input.vue";
import Label from "../../components/ui/label/Label.vue";
import Select from "../../components/ui/select/Select.vue";
import Textarea from "../../components/ui/textarea/Textarea.vue";
import { getTaskStatusLabel } from "../../lib/taskStatus";
import { TASK_STATUSES, type TaskStatus } from "../../types/task";

type TaskCreateInput = {
  title: string;
  description: string | null;
  status: TaskStatus;
};

const props = defineProps<{
  isCreating: boolean;
  createError: string | null;
  resetSignal: number;
}>();

const emit = defineEmits<{
  create: [payload: TaskCreateInput];
}>();

const form = reactive({
  title: "",
  description: "",
  status: "todo" as TaskStatus,
});

const formError = ref<string | null>(null);

watch(
  () => props.resetSignal,
  () => {
    form.title = "";
    form.description = "";
    form.status = "todo";
    formError.value = null;
  },
);

const submitCreateTask = () => {
  formError.value = null;

  const title = form.title.trim();
  if (!title) {
    formError.value = "Task title is required.";
    return;
  }

  emit("create", {
    title,
    description: form.description.trim() || null,
    status: form.status,
  });
};
</script>

<template>
  <Card as="article" class="task-create-card">
    <h2 class="section-title">Create task</h2>
    <form class="form-stack" @submit.prevent="submitCreateTask">
      <Label for="new-task-title">Title</Label>
      <Input
        id="new-task-title"
        v-model="form.title"
        maxlength="120"
        required
      />

      <Label for="new-task-description">Description</Label>
      <Textarea
        id="new-task-description"
        v-model="form.description"
        rows="4"
      />

      <Label for="new-task-status">Initial status</Label>
      <Select id="new-task-status" v-model="form.status">
        <option v-for="status in TASK_STATUSES" :key="status" :value="status">
          {{ getTaskStatusLabel(status) }}
        </option>
      </Select>

      <p v-if="formError" class="error-banner">
        {{ formError }}
      </p>
      <p v-else-if="createError" class="error-banner">
        {{ createError }}
      </p>

      <Button type="submit" :disabled="isCreating">
        {{ isCreating ? "Creating..." : "Create task" }}
      </Button>
    </form>
  </Card>
</template>

<style scoped>
.task-create-card {
  padding: 24px;
}

.section-title {
  margin: 0 0 12px;
  font-size: 18px;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

@media (max-width: 640px) {
  .task-create-card {
    padding: 18px;
  }
}
</style>
