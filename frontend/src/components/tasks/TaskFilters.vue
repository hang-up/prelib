<script setup lang="ts">
import Button from "../../components/ui/button/Button.vue";
import { TASK_FILTER_OPTIONS } from "../../lib/taskStatus";
import type { TaskFilter } from "../../types/task";

defineProps<{
  currentFilter: TaskFilter;
  myTasksOnly: boolean;
}>();

const emit = defineEmits<{
  change: [filter: TaskFilter];
  toggleMyTasks: [];
}>();
</script>

<template>
  <div class="filter-group">
    <Button
      v-for="filter in TASK_FILTER_OPTIONS"
      :key="filter.value"
      type="button"
      size="sm"
      :variant="currentFilter === filter.value ? 'default' : 'outline'"
      @click="emit('change', filter.value)"
    >
      {{ filter.label }}
    </Button>

    <Button
      type="button"
      size="sm"
      :variant="myTasksOnly ? 'default' : 'outline'"
      @click="emit('toggleMyTasks')"
    >
      My tasks
    </Button>
  </div>
</template>

<style scoped>
.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
