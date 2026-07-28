<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div
    data-slot="card"
    :class="
      cn(
        'flex flex-col gap-6 rounded-2xl bg-card py-6 text-card-foreground ring-1 ring-foreground/10 [--card-spacing:theme(spacing.6)]',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
