import type { PageMetaConfig } from '@/router/config';
import { dirMeta, pageMeta } from '@/router/config';

export interface NavMainItem {
  title: string;
  url: string;
  icon?: string;
  isActive?: boolean;
  items?: NavMainSubItem[];
}

export interface NavMainSubItem {
  title: string;
  url: string;
  icon?: string;
}

function deriveTitleFromPath(path: string): string {
  const segments = path.split('/').filter(Boolean);
  const last = segments[segments.length - 1] ?? '';
  return last.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function deriveTitleFromDirName(dirName: string): string {
  return dirName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getRouteMenuItems(): NavMainItem[] {
  const allRoutes: { path: string; meta: PageMetaConfig }[] = [];

  for (const [path, meta] of Object.entries(pageMeta)) {
    if (path === '/home') {
      continue;
    }
    if (meta.hidden) {
      continue;
    }
    allRoutes.push({ path, meta });
  }

  allRoutes.sort((a, b) => {
    const pathA = a.path;
    const pathB = b.path;
    if (pathA.includes('*')) {
      return 1;
    }
    if (pathB.includes('*')) {
      return -1;
    }
    const segmentsA = pathA.split('/').filter(Boolean).length;
    const segmentsB = pathB.split('/').filter(Boolean).length;
    if (segmentsA !== segmentsB) {
      return segmentsA - segmentsB;
    }
    return pathA.localeCompare(pathB);
  });

  const topLevelFiles: { path: string; meta: PageMetaConfig }[] = [];
  const groupedByDir = new Map<string, { path: string; meta: PageMetaConfig }[]>();

  for (const { path, meta } of allRoutes) {
    const segments = path.split('/').filter(Boolean);
    if (segments.length <= 1) {
      topLevelFiles.push({ path, meta });
    } else {
      const dirName = segments[0];
      const existing = groupedByDir.get(dirName) || [];
      existing.push({ path, meta });
      groupedByDir.set(dirName, existing);
    }
  }

  const items: NavMainItem[] = [];

  for (const { path, meta } of topLevelFiles) {
    items.push({
      title: meta.title ?? deriveTitleFromPath(path),
      url: path,
      icon: meta.icon,
      isActive: meta.isActive,
    });
  }

  for (const [dirName, dirMetas] of groupedByDir) {
    const dirConfig = dirMeta[dirName];
    const subItems: NavMainSubItem[] = [];

    for (const { path, meta } of dirMetas) {
      subItems.push({
        title: meta.title ?? deriveTitleFromPath(path),
        url: path,
        icon: meta.icon,
      });
    }

    if (subItems.length === 0) {
      continue;
    }

    items.push({
      title: dirConfig?.title ?? deriveTitleFromDirName(dirName),
      url: '',
      icon: dirConfig?.icon,
      isActive: dirConfig?.isActive,
      items: subItems,
    });
  }

  return items;
}
