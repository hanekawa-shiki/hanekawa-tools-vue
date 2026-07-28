<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { cn } from '@/lib/utils';
import { pageMeta } from '@/router/config';

const route = useRoute();
const meta = computed(() => pageMeta[route.path]);
const sentinelRef = ref<HTMLDivElement | null>(null);
const scrolled = ref(false);

let observer: IntersectionObserver | undefined;

onMounted(() => {
  if (sentinelRef.value) {
    observer = new IntersectionObserver(
      ([entry]) => {
        scrolled.value = !entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(sentinelRef.value);
  }
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<template>
  <template v-if="meta?.title">
    <div
      :class="
        cn(
          'sticky top-0 z-10 -mx-4 -mt-4 flex flex-col bg-background px-4 pt-4 pb-2 backdrop-blur-sm transition-shadow lg:mx-0 lg:mt-0 lg:px-0 lg:py-4',
          scrolled && 'shadow-sm'
        )
      "
    >
      <h1 class="text-lg font-semibold">
        {{ meta.title }}
      </h1>
      <p v-if="meta.description" class="text-sm text-muted-foreground">
        {{ meta.description }}
      </p>
    </div>
    <div ref="sentinelRef" class="h-0" />
  </template>
</template>
