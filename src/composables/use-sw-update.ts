import { useDocumentVisibility } from '@vueuse/core';
import { onMounted, ref, watch } from 'vue';

const needRefresh = ref(false);
const registration = ref<ServiceWorkerRegistration | null>(null);

export function useSWUpdate() {
  const visibility = useDocumentVisibility();

  async function checkForUpdates() {
    if (!registration.value) {
      return;
    }
    try {
      await registration.value.update();
    } catch (e) {
      console.error('SW update check failed:', e);
    }
  }

  async function applyUpdate() {
    if (!registration.value?.waiting) {
      return;
    }
    registration.value.waiting.postMessage({ type: 'SKIP_WAITING' });
    needRefresh.value = false;
  }

  function setRegistration(reg: ServiceWorkerRegistration) {
    registration.value = reg;
    reg.addEventListener('updatefound', () => {
      const installing = reg.installing;
      if (!installing) {
        return;
      }
      installing.addEventListener('statechange', () => {
        if (installing.state === 'installed' && navigator.serviceWorker.controller) {
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
