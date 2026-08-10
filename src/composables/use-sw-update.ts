import { ref } from 'vue';

export const PWA_UPDATED_KEY = 'hanekawa-pwa-updated';

function formatTime() {
  return new Date().toLocaleTimeString('zh-CN', { hour12: false });
}

export function pwaLog(message: string, ...args: unknown[]) {
  console.warn(`[PWA][${formatTime()}] ${message}`, ...args);
}

export function pwaLogError(message: string, ...args: unknown[]) {
  console.error(`[PWA][${formatTime()}] ${message}`, ...args);
}

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
      pwaLogError('更新检查失败:', e);
    }
  }

  function setRegistration(reg: ServiceWorkerRegistration) {
    registration.value = reg;
  }

  return { checkForUpdates, setRegistration };
}
