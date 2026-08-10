<script setup lang="ts">
import { onMounted } from 'vue';
import { toast } from 'vue-sonner';
import ThemeProvider from '@/components/theme-provider.vue';
import { Toaster } from '@/components/ui/sonner';
import { PWA_UPDATED_KEY } from '@/composables/use-sw-update';

onMounted(() => {
  if (sessionStorage.getItem(PWA_UPDATED_KEY)) {
    sessionStorage.removeItem(PWA_UPDATED_KEY);
    toast.success('更新成功，当前已是最新版本', {
      description: '新版本已加载，快去体验新功能吧',
    });
  }
});
</script>

<template>
  <ThemeProvider default-theme="system" storage-key="vite-ui-theme">
    <RouterView />
    <Toaster position="bottom-right" />
  </ThemeProvider>
</template>
