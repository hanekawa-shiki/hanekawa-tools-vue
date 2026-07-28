<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center gap-6 text-center">
    <div class="relative">
      <span
        class="text-8xl font-extrabold tracking-tighter text-muted-foreground/20 select-none sm:text-9xl"
      >
        404
      </span>
      <div class="absolute inset-0 flex items-center justify-center">
        <span class="text-xl font-semibold text-muted-foreground">页面走丢了</span>
      </div>
    </div>
    <p class="max-w-sm text-sm text-muted-foreground">
      你访问的页面不存在或已被移除，请检查地址是否正确。
    </p>
    <div class="flex items-center gap-3">
      <button
        class="inline-flex h-9 items-center justify-center gap-2 rounded-4xl bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        @click="router.push('/')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        返回首页
      </button>
      <button
        class="inline-flex h-9 items-center justify-center gap-2 rounded-4xl border border-border bg-input/30 px-3 text-sm font-medium transition-colors hover:bg-input/50 hover:text-foreground"
        @click="router.back()"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M9 14 4 9l5-5" />
          <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />
        </svg>
        返回上页
      </button>
    </div>
  </div>
</template>
