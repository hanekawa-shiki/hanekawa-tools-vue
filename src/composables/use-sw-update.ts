import { ref } from 'vue';

export const PWA_UPDATED_KEY = 'hanekawa-pwa-updated';

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

  function setRegistration(reg: ServiceWorkerRegistration) {
    registration.value = reg;
  }

  return { checkForUpdates, setRegistration };
}
