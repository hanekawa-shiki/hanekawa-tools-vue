import { ref } from 'vue';

const needRefresh = ref(false);
const registration = ref<ServiceWorkerRegistration | null>(null);
let lastCheck = 0;

export function useSWUpdate() {
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
    if (!needRefresh.value || !registration.value?.waiting) {
      return;
    }
    console.warn('[PWA] 正在应用更新...');
    needRefresh.value = false;

    const sw = registration.value.waiting;
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      () => {
        window.location.reload();
      },
      { once: true }
    );
    sw.postMessage({ type: 'SKIP_WAITING' });
  }

  function setRegistration(reg: ServiceWorkerRegistration) {
    registration.value = reg;
  }

  function setNeedRefresh() {
    needRefresh.value = true;
  }

  return { needRefresh, checkForUpdates, applyUpdate, setRegistration, setNeedRefresh };
}
