<script setup lang="ts">
import { computed, useAttrs } from "vue";

import { cn, type ClassValue } from "../../../lib/utils";

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    as?: string;
  }>(),
  {
    as: "div",
  },
);

const attrs = useAttrs();

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs;
  return rest;
});

const cardClass = computed(() => cn("ui-card", attrs.class as ClassValue));
</script>

<template>
  <component :is="props.as" v-bind="forwardedAttrs" :class="cardClass">
    <slot />
  </component>
</template>

<style scoped>
.ui-card {
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  background: hsl(var(--card));
  color: hsl(var(--card-foreground));
  box-shadow: var(--shadow-sm);
}
</style>
