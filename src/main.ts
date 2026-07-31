import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';

import { registerSW } from 'virtual:pwa-register';
import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import App from './App.vue';
import Icon from './components/icon.vue';
import { useSWUpdate } from './composables/use-sw-update';
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

registerSW({
  immediate: true,
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
