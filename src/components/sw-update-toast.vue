<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

const needRefresh = ref(false);

const close = () => {
  needRefresh.value = false;
};

let updateHandler: (() => void) | null = null;
let newWorker: ServiceWorker | null = null;

async function checkForUpdates() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.update();
  } catch {
    // 更新检查失败，忽略
  }
}

async function applyUpdate() {
  if (!newWorker) {
    return;
  }

  newWorker.postMessage({ type: 'skip-waiting' });
}

function onNewWorkerActivated() {
  needRefresh.value = true;
  toast('新版本已就绪', {
    description: '点击刷新以应用最新版本',
    duration: Infinity,
    action: { label: '刷新', onClick: () => window.location.reload() },
    cancel: { label: '稍后', onClick: close },
  });
}

const router = useRouter();

onMounted(async () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    console.warn('[SW] 注册成功', reg.scope);

    if (reg.waiting) {
      newWorker = reg.waiting;
      onNewWorkerActivated();
    }

    updateHandler = () => {
      const installing = reg.installing;
      if (!installing) {
        return;
      }
      console.warn('[SW] 发现新版本，正在下载…');
      installing.addEventListener('statechange', (e) => {
        const worker = e.target as ServiceWorker;
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          newWorker = worker;
          applyUpdate();
        }
      });
    };

    reg.addEventListener('updatefound', updateHandler);

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.warn('[SW] 新版本已激活');
      if (needRefresh.value) {
        toast('资源已更新', {
          description: '点击刷新页面使新版本生效',
          duration: Infinity,
          action: { label: '刷新', onClick: () => window.location.reload() },
          cancel: { label: '稍后', onClick: close },
        });
      }
    });

    router.afterEach(() => {
      checkForUpdates();
    });
  } catch (err) {
    console.error('[SW] 注册失败', err);
  }
});

onUnmounted(() => {
  if (updateHandler) {
    navigator.serviceWorker.ready.then((reg) => {
      reg.removeEventListener('updatefound', updateHandler!);
    });
  }
});
</script>

<template>
  <div></div>
</template>
