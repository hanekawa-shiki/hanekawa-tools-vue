import { ref } from 'vue';

const needRefresh = ref(false);

export function useSWUpdate() {
  function setNeedRefresh() {
    needRefresh.value = true;
  }

  async function applyUpdate() {
    if (!needRefresh.value) {
      return;
    }
    console.warn('[PWA] 正在应用更新...');
    needRefresh.value = false;
    window.location.reload();
  }

  return { needRefresh, setNeedRefresh, applyUpdate };
}
