<script setup lang="ts">
import { computed, useAttrs } from "vue";

import { cn, type ClassValue } from "../../../lib/utils";

defineOptions({
  inheritAttrs: false,
});

const attrs = useAttrs();

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs;
  return rest;
});

const labelClass = computed(() => cn("ui-label", attrs.class as ClassValue));
</script>

<template>
  <label v-bind="forwardedAttrs" :class="labelClass">
    <slot />
  </label>
</template>

<style scoped>
.ui-label {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.3;
  color: hsl(var(--foreground));
}
</style>
