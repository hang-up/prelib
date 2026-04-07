<script setup lang="ts">
import { computed, useAttrs } from "vue";

import { cn, type ClassValue } from "../../../lib/utils";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  modelValue?: string | number;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const attrs = useAttrs();

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs;
  return rest;
});

const inputClass = computed(() => cn("ui-input", attrs.class as ClassValue));

const onInput = (event: Event) => {
  emit("update:modelValue", (event.target as HTMLInputElement).value);
};
</script>

<template>
  <input
    v-bind="forwardedAttrs"
    :class="inputClass"
    :value="props.modelValue"
    @input="onInput"
  />
</template>

<style scoped>
.ui-input {
  width: 100%;
  min-height: 2.5rem;
  border: 1px solid hsl(var(--input));
  border-radius: calc(var(--radius) - 2px);
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 0.875rem;
  padding: 0.625rem 0.75rem;
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease;
}

.ui-input::placeholder {
  color: hsl(var(--muted-foreground));
}

.ui-input:focus-visible {
  outline: none;
  border-color: hsl(var(--ring) / 0.65);
  box-shadow: 0 0 0 3px hsl(var(--ring) / 0.15);
}

.ui-input:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}
</style>
