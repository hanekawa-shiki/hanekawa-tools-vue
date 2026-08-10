import type { RouteRecordRaw } from 'vue-router';

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

interface ToolPageEntry {
  /** 子路由路径（不含前导斜杠） */
  path: string;
  title: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  hidden?: boolean;
  component: () => Promise<unknown>;
}

const toolPages: ToolPageEntry[] = [
  {
    path: 'home',
    title: '首页',
    icon: 'HomeIcon',
    hidden: true,
    component: async () => import('@/pages/index.vue'),
  },
  {
    path: 'query/calendar',
    title: '日历',
    description: '提供公历、农历日期查询。',
    icon: 'CalendarIcon',
    component: async () => import('@/pages/query/calendar.vue'),
  },
  {
    path: 'query/oil-prices',
    title: '油价',
    description: '查询全国各地最新汽油、柴油价格。',
    icon: 'FuelStationIcon',
    component: async () => import('@/pages/query/oil-prices.vue'),
  },
  {
    path: 'query/media-types',
    title: 'Media Types',
    description: '查询全部 Media Type(MIME 类型)，支持文件后缀和类型名模糊搜索。',
    icon: 'FileTypeIcon',
    component: async () => import('@/pages/query/media-types.vue'),
  },
  {
    path: 'transform/torrent2magnet',
    title: '种子转磁力链',
    description:
      '将 Torrent 种子文件快速转换为磁力链接，方便直接下载。支持批量转换及 Magnet 导出到文件',
    icon: 'MagnetIcon',
    component: async () => import('@/pages/transform/torrent2magnet.vue'),
  },
  {
    path: 'transform/invoice-merge',
    title: '发票合并',
    description: '将多张发票 PDF 合并到 A4 页面上，支持 2 张或 4 张排列，拖拽排序后导出打印。',
    icon: 'Layers01Icon',
    component: async () => import('@/pages/transform/invoice-merge.vue'),
  },
  {
    path: 'transform/color-picker',
    title: '取色器',
    description: '在线取色器，支持 HEX、RGB、HSL、HSV、CMYK 等多种颜色格式一键复制。',
    icon: 'ColorPickerIcon',
    component: async () => import('@/pages/transform/color-picker.vue'),
  },
];

export const pageMeta: Record<string, PageMetaConfig> = Object.fromEntries(
  toolPages.map(({ path, title, description, icon, isActive, hidden }) => [
    `/${path}`,
    { title, description, icon, isActive, hidden },
  ])
);

export const routeConfig: RouteRecordRaw[] = toolPages.map(
  ({ path, title, description, icon, isActive, hidden, component }) => ({
    path,
    name: path.replace(/\//g, '-'),
    component,
    meta: { title, description, icon, isActive, hidden },
  })
);
