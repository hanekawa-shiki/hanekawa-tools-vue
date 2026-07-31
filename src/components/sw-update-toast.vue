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

function applyUpdate() {
  if (!newWorker) {
    window.location.reload();
    return;
  }

  newWorker.postMessage({ type: 'skip-waiting' });

  const onActivated = () => {
    navigator.serviceWorker.removeEventListener('controllerchange', onActivated);
    window.location.reload();
  };
  navigator.serviceWorker.addEventListener('controllerchange', onActivated);
}

function onNewWorkerActivated() {
  needRefresh.value = true;
  toast('新版本已就绪', {
    description: '点击刷新以应用最新版本',
    duration: Infinity,
    action: { label: '刷新', onClick: applyUpdate },
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
          onNewWorkerActivated();
        }
      });
    };

    reg.addEventListener('updatefound', updateHandler);

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
