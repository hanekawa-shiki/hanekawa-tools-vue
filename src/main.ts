import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';

import { registerSW } from 'virtual:pwa-register';
import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import { toast } from 'vue-sonner';
import App from './App.vue';
import Icon from './components/icon.vue';
import { PWA_UPDATED_KEY, useSWUpdate } from './composables/use-sw-update';
import { routeConfig } from './router/config';
import 'dayjs/locale/zh-cn';
import './index.css';

dayjs.locale('zh-cn');
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(utc);
dayjs.extend(timezone);

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: async () => import('@/layout/index.vue'),
      children: [
        { path: '', redirect: '/home' },
        ...routeConfig,
        { path: '/:pathMatch(.*)*', component: async () => import('@/pages/404.vue') },
      ],
    },
  ],
});

const app = createApp(App);
app.use(router);
app.component('Icon', Icon);
app.mount('#app');

const { setRegistration, checkForUpdates } = useSWUpdate();

let updateToastId: string | number | null = null;

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.warn('[PWA] 发现新版本');
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
    console.warn('[PWA] 新版本已就绪，刷新页面...');
    sessionStorage.setItem(PWA_UPDATED_KEY, '1');
    window.location.reload();
  },
  onOfflineReady() {
    console.warn('[PWA] 应用已可离线使用');
  },
  onRegisteredSW(_swUrl, reg) {
    if (reg != null) {
      console.warn('[PWA] 注册成功, scope:', reg.scope);
      setRegistration(reg);
    }
  },
  onRegistrationError(error) {
    console.error('[PWA] 注册失败:', error);
  },
});

void router.afterEach(() => {
  void checkForUpdates();
});
