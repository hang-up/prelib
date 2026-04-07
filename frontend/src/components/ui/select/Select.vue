<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { ChevronDown } from "lucide-vue-next";

import { cn, type ClassValue } from "../../../lib/utils";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  modelValue?: string | number | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [event: Event];
}>();

const attrs = useAttrs();

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs;
  return rest;
});

const isDisabled = computed(() => Boolean(forwardedAttrs.value.disabled));
const shellClass = computed(() =>
  cn("ui-select-shell", attrs.class as ClassValue, {
    "ui-select-shell--disabled": isDisabled.value,
  }),
);

const onChange = (event: Event) => {
  emit("update:modelValue", (event.target as HTMLSelectElement).value);
  emit("change", event);
};
</script>

<template>
  <div :class="shellClass">
    <select
      v-bind="forwardedAttrs"
      class="ui-select"
      :value="props.modelValue ?? ''"
      @change="onChange"
    >
      <slot />
    </select>
    <ChevronDown :size="16" class="ui-select-icon" aria-hidden="true" />
  </div>
</template>

<style scoped>
.ui-select-shell {
  position: relative;
  width: 100%;
}

.ui-select {
  width: 100%;
  min-height: 2.5rem;
  appearance: none;
  border: 1px solid hsl(var(--input));
  border-radius: calc(var(--radius) - 2px);
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 0.875rem;
  padding: 0.625rem 2.25rem 0.625rem 0.75rem;
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease;
}

.ui-select:focus-visible {
  outline: none;
  border-color: hsl(var(--ring) / 0.65);
  box-shadow: 0 0 0 3px hsl(var(--ring) / 0.15);
}

.ui-select:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.ui-select-icon {
  position: absolute;
  top: 50%;
  right: 0.75rem;
  color: hsl(var(--muted-foreground));
  pointer-events: none;
  transform: translateY(-50%);
}

.ui-select-shell--disabled .ui-select-icon {
  opacity: 0.65;
}
</style>
