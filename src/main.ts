import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';

import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import App from './App.vue';
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
        { path: 'home', component: async () => import('@/pages/index.vue') },
        { path: 'query/calendar', component: async () => import('@/pages/query/calendar.vue') },
        { path: 'query/oil-prices', component: async () => import('@/pages/query/oil-prices.vue') },
        {
          path: 'query/media-types',
          component: async () => import('@/pages/query/media-types.vue'),
        },
        {
          path: 'transform/torrent2magnet',
          component: async () => import('@/pages/transform/torrent2magnet.vue'),
        },
        {
          path: 'transform/invoice-merge',
          component: async () => import('@/pages/transform/invoice-merge.vue'),
        },
        {
          path: 'transform/color-picker',
          component: async () => import('@/pages/transform/color-picker.vue'),
        },
        { path: '/:pathMatch(.*)*', component: async () => import('@/pages/404.vue') },
      ],
    },
  ],
});

const app = createApp(App);
app.use(router);
app.mount('#app');
