import type { Router } from 'vue-router';
import { registerSW } from 'virtual:pwa-register';
import { toast } from 'vue-sonner';
import { PWA_UPDATED_KEY, pwaLog, pwaLogError, useSWUpdate } from '@/composables/use-sw-update';

let reloadToastId: string | number | null = null;
let updateToastId: string | number | null = null;

function isChunkLoadError(message: string) {
  return /Failed to (?:fetch dynamically imported module|load module script)/i.test(message);
}

function showReloadToast() {
  if (reloadToastId != null) {
    return;
  }
  reloadToastId = toast.error('页面资源加载失败', {
    description: '检测到页面资源已更新，请重新加载',
    duration: Number.POSITIVE_INFINITY,
    action: {
      label: '重新加载',
      onClick: () => window.location.reload(),
    },
  });
}

export function setupPWA(router: Router) {
  const { setRegistration, checkForUpdates } = useSWUpdate();

  router.onError((error: Error) => {
    if (isChunkLoadError(error.message)) {
      showReloadToast();
    }
  });

  window.addEventListener('error', (event) => {
    const { message } = event;
    if (message !== '' && isChunkLoadError(message)) {
      showReloadToast();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason as { message?: string } | string | null | undefined;
    if (
      typeof reason === 'object' &&
      reason !== null &&
      reason.message != null &&
      isChunkLoadError(reason.message)
    ) {
      showReloadToast();
    }
  });

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      pwaLog('发现新版本');
      if (updateToastId != null) {
        toast.dismiss(updateToastId);
      }
      updateToastId = toast.info('发现新版本', {
        description: '点击「立即更新」刷新页面并加载新功能',
        duration: Number.POSITIVE_INFINITY,
        action: {
          label: '立即更新',
          onClick: () => {
            updateToastId = null;
            void updateSW(true);
          },
        },
      });
    },
    onNeedReload() {
      pwaLog('新版本已就绪，刷新页面...');
      sessionStorage.setItem(PWA_UPDATED_KEY, '1');
      window.location.reload();
    },
    onOfflineReady() {
      pwaLog('应用已可离线使用');
    },
    onRegisteredSW(_swUrl, reg) {
      if (reg != null) {
        pwaLog('注册成功, scope:', reg.scope);
        setRegistration(reg);
      }
    },
    onRegistrationError(error) {
      pwaLogError('注册失败:', error);
    },
  });

  void router.afterEach(() => {
    void checkForUpdates();
  });
}
