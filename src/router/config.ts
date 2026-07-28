import type { RouteMeta, RouteRecordRaw } from 'vue-router';

export const dirMeta: Record<string, PageMetaConfig> = {
  transform: {
    title: '转换',
    icon: 'ArrowLeftRightIcon',
    isActive: true,
  },
  query: {
    title: '查询',
    icon: 'BinocularsIcon',
    isActive: true,
  },
};

export const pageMeta: Record<string, PageMetaConfig> = {
  '/home': {
    title: '首页',
    icon: 'HomeIcon',
    hidden: true,
  },
  '/query/calendar': {
    title: '日历',
    description: '提供公历、农历日期查询。',
    icon: 'CalendarIcon',
  },
  '/query/oil-prices': {
    title: '油价',
    description: '查询全国各地最新汽油、柴油价格。',
    icon: 'FuelStationIcon',
  },
  '/transform/torrent2magnet': {
    title: '种子转磁力链',
    description:
      '将 Torrent 种子文件快速转换为磁力链接，方便直接下载。支持批量转换及 Magnet 导出到文件',
    icon: 'MagnetIcon',
  },
  '/transform/invoice-merge': {
    title: '发票合并',
    description: '将多张发票 PDF 合并到 A4 页面上，支持 2 张或 4 张排列，拖拽排序后导出打印。',
    icon: 'Layers01Icon',
  },
  '/transform/color-picker': {
    title: '取色器',
    description: '在线取色器，支持 HEX、RGB、HSL、HSV、CMYK 等多种颜色格式一键复制。',
    icon: 'ColorPickerIcon',
  },
  '/query/media-types': {
    title: 'Media Types',
    description: '查询全部 Media Type(MIME 类型)，支持文件后缀和类型名模糊搜索。',
    icon: 'FileTypeIcon',
  },
};

export const routeConfig: RouteRecordRaw[] = [
  {
    path: '',
    name: 'home',
    component: async () => import('@/pages/index.vue'),
    meta: pageMeta['/home'] as RouteMeta,
  },
  {
    path: 'query/calendar',
    name: 'query-calendar',
    component: async () => import('@/pages/query/calendar.vue'),
    meta: pageMeta['/query/calendar'] as RouteMeta,
  },
  {
    path: 'query/oil-prices',
    name: 'query-oil-prices',
    component: async () => import('@/pages/query/oil-prices.vue'),
    meta: pageMeta['/query/oil-prices'] as RouteMeta,
  },
  {
    path: 'query/media-types',
    name: 'query-media-types',
    component: async () => import('@/pages/query/media-types.vue'),
    meta: pageMeta['/query/media-types'] as RouteMeta,
  },
  {
    path: 'transform/torrent2magnet',
    name: 'transform-torrent2magnet',
    component: async () => import('@/pages/transform/torrent2magnet.vue'),
    meta: pageMeta['/transform/torrent2magnet'] as RouteMeta,
  },
  {
    path: 'transform/invoice-merge',
    name: 'transform-invoice-merge',
    component: async () => import('@/pages/transform/invoice-merge.vue'),
    meta: pageMeta['/transform/invoice-merge'] as RouteMeta,
  },
  {
    path: 'transform/color-picker',
    name: 'transform-color-picker',
    component: async () => import('@/pages/transform/color-picker.vue'),
    meta: pageMeta['/transform/color-picker'] as RouteMeta,
  },
];
