<script setup lang="ts">
import { computed, useAttrs } from "vue";

import { cn, type ClassValue } from "../../../lib/utils";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  modelValue?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const attrs = useAttrs();

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs;
  return rest;
});

const textareaClass = computed(() => cn("ui-textarea", attrs.class as ClassValue));

const onInput = (event: Event) => {
  emit("update:modelValue", (event.target as HTMLTextAreaElement).value);
};
</script>

<template>
  <textarea
    v-bind="forwardedAttrs"
    :class="textareaClass"
    :value="props.modelValue"
    @input="onInput"
  />
</template>

<style scoped>
.ui-textarea {
  width: 100%;
  min-height: 6rem;
  border: 1px solid hsl(var(--input));
  border-radius: calc(var(--radius) - 2px);
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 0.875rem;
  line-height: 1.5;
  padding: 0.625rem 0.75rem;
  resize: vertical;
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease;
}

.ui-textarea::placeholder {
  color: hsl(var(--muted-foreground));
}

.ui-textarea:focus-visible {
  outline: none;
  border-color: hsl(var(--ring) / 0.65);
  box-shadow: 0 0 0 3px hsl(var(--ring) / 0.15);
}

.ui-textarea:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}
</style>
