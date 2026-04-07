<script setup lang="ts">
import { cva, type VariantProps } from "class-variance-authority";
import { computed, useAttrs } from "vue";

import { cn, type ClassValue } from "../../../lib/utils";

defineOptions({
  inheritAttrs: false,
});

const badgeVariants = cva("ui-badge", {
  variants: {
    variant: {
      default: "ui-badge--default",
      secondary: "ui-badge--secondary",
      outline: "ui-badge--outline",
      success: "ui-badge--success",
      muted: "ui-badge--muted",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type BadgeVariants = VariantProps<typeof badgeVariants>;

const props = withDefaults(
  defineProps<{
    variant?: BadgeVariants["variant"];
  }>(),
  {
    variant: "default",
  },
);

const attrs = useAttrs();

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs;
  return rest;
});

const badgeClass = computed(() =>
  cn(badgeVariants({ variant: props.variant }), attrs.class as ClassValue),
);
</script>

<template>
  <span v-bind="forwardedAttrs" :class="badgeClass">
    <slot />
  </span>
</template>

<style scoped>
.ui-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0.2rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
}

.ui-badge--default {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.ui-badge--secondary {
  background: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
}

.ui-badge--outline {
  border-color: hsl(var(--border));
  background: hsl(var(--background));
  color: hsl(var(--muted-foreground));
}

.ui-badge--success {
  background: hsl(140 60% 35%);
  color: hsl(0 0% 98%);
}

.ui-badge--muted {
  background: hsl(var(--secondary) / 0.7);
  color: hsl(var(--muted-foreground));
}
</style>
