<script setup lang="ts">
import { cva, type VariantProps } from "class-variance-authority";
import { computed, useAttrs } from "vue";

import { cn, type ClassValue } from "../../../lib/utils";

defineOptions({
  inheritAttrs: false,
});

const buttonVariants = cva("ui-button", {
  variants: {
    variant: {
      default: "ui-button--default",
      secondary: "ui-button--secondary",
      outline: "ui-button--outline",
      ghost: "ui-button--ghost",
      destructive: "ui-button--destructive",
    },
    size: {
      default: "ui-button--size-default",
      sm: "ui-button--size-sm",
      lg: "ui-button--size-lg",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

type ButtonVariants = VariantProps<typeof buttonVariants>;

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariants["variant"];
    size?: ButtonVariants["size"];
  }>(),
  {
    variant: "default",
    size: "default",
  },
);

const attrs = useAttrs();

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs;
  return rest;
});

const buttonClass = computed(() =>
  cn(buttonVariants({ variant: props.variant, size: props.size }), attrs.class as ClassValue),
);
</script>

<template>
  <button v-bind="forwardedAttrs" :class="buttonClass">
    <slot />
  </button>
</template>

<style scoped>
.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid transparent;
  border-radius: calc(var(--radius) - 2px);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    color 150ms ease,
    box-shadow 150ms ease;
}

.ui-button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px hsl(var(--ring) / 0.2);
}

.ui-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ui-button--default {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.ui-button--default:hover:not(:disabled) {
  background: hsl(var(--primary) / 0.9);
}

.ui-button--secondary {
  background: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
}

.ui-button--secondary:hover:not(:disabled) {
  background: hsl(var(--secondary) / 0.85);
}

.ui-button--outline {
  border-color: hsl(var(--input));
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}

.ui-button--outline:hover:not(:disabled) {
  background: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}

.ui-button--ghost {
  background: transparent;
  color: hsl(var(--foreground));
}

.ui-button--ghost:hover:not(:disabled) {
  background: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}

.ui-button--destructive {
  background: hsl(var(--destructive));
  color: hsl(var(--destructive-foreground));
}

.ui-button--destructive:hover:not(:disabled) {
  background: hsl(var(--destructive) / 0.9);
}

.ui-button--size-default {
  min-height: 2.5rem;
  padding: 0.625rem 1rem;
}

.ui-button--size-sm {
  min-height: 2rem;
  padding: 0.45rem 0.75rem;
  font-size: 0.75rem;
}

.ui-button--size-lg {
  width: 100%;
  min-height: 2.75rem;
  padding: 0.75rem 1rem;
}
</style>
