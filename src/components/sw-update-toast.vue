<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { toast } from 'vue-sonner';

const offlineReady = ref(false);
const needRefresh = ref(false);

const close = () => {
  offlineReady.value = false;
  needRefresh.value = false;
};

let updateHandler: (() => void) | null = null;

onMounted(async () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const reg = await navigator.serviceWorker.ready;

    if (reg.waiting) {
      needRefresh.value = true;
    }

    updateHandler = () => {
      const newWorker = reg.installing;
      if (!newWorker) {
        return;
      }
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          needRefresh.value = true;
        }
      });
    };

    reg.addEventListener('updatefound', updateHandler);

    if (reg.active && !navigator.serviceWorker.controller) {
      offlineReady.value = true;
    }
  } catch {
    // SW 注册失败，忽略
  }
});

onUnmounted(() => {
  if (updateHandler) {
    navigator.serviceWorker.ready.then((reg) => {
      reg.removeEventListener('updatefound', updateHandler!);
    });
  }
});

watch(offlineReady, (val) => {
  if (val) {
    toast.info('应用已缓存，可离线使用');
  }
});

watch(needRefresh, (val) => {
  if (val) {
    toast('发现新版本', {
      description: '点击刷新以获取最新版本',
      duration: Infinity,
      action: { label: '刷新', onClick: () => window.location.reload() },
      cancel: { label: '稍后', onClick: close },
    });
  }
});
</script>

<template>
  <div></div>
</template>
