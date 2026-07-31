<script setup lang="ts">
import ThemeProvider from '@/components/theme-provider.vue';
import { Toaster } from '@/components/ui/sonner';
</script>

<template>
  <ThemeProvider default-theme="system" storage-key="vite-ui-theme">
    <RouterView />
    <Toaster position="bottom-right" />
  </ThemeProvider>
</template>
