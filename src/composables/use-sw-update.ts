import { useDocumentVisibility } from '@vueuse/core';
import { onMounted, ref, watch } from 'vue';

const needRefresh = ref(false);
const registration = ref<ServiceWorkerRegistration | null>(null);
let lastCheck = 0;

export function useSWUpdate() {
  const visibility = useDocumentVisibility();

  async function checkForUpdates() {
    if (!registration.value) {
      return;
    }
    const now = Date.now();
    if (now - lastCheck < 60_000) {
      return;
    }
    lastCheck = now;
    try {
      await registration.value.update();
    } catch (e) {
      console.error('[PWA] 更新检查失败:', e);
    }
  }

  function applyUpdate() {
    if (!registration.value?.waiting) {
      return;
    }
    console.warn('[PWA] 正在应用更新...');
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      () => {
        window.location.reload();
      },
      { once: true }
    );
    registration.value.waiting.postMessage({ type: 'SKIP_WAITING' });
    needRefresh.value = false;
  }

  function setRegistration(reg: ServiceWorkerRegistration) {
    registration.value = reg;

    if (!navigator.serviceWorker.controller) {
      return;
    }

    reg.addEventListener('updatefound', () => {
      const installing = reg.installing;
      if (!installing) {
        return;
      }
      installing.addEventListener('statechange', () => {
        if (installing.state === 'installed' && navigator.serviceWorker.controller) {
          console.warn('[PWA] 发现新版本');
          needRefresh.value = true;
        }
      });
    });
  }

  onMounted(() => {
    if (visibility.value === 'visible') {
      void checkForUpdates();
    }
  });

  watch(visibility, (val) => {
    if (val === 'visible') {
      void checkForUpdates();
    }
  });

  return { needRefresh, checkForUpdates, applyUpdate, setRegistration };
}
