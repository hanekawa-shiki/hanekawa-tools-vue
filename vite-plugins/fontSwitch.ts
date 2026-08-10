import type { Plugin, ResolvedConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONT_ROOT = path.resolve(__dirname, '../node_modules/lxgw-wenkai-webfont');

const FONT_CSS_FILES = [
  'style.css',
  'lxgwwenkai-regular.css',
  'lxgwwenkai-light.css',
  'lxgwwenkai-bold.css',
  'lxgwwenkaimono-regular.css',
  'lxgwwenkaimono-light.css',
  'lxgwwenkaimono-bold.css',
];

function collectFontAssets(): { fileName: string; source: Uint8Array }[] {
  const assets: { fileName: string; source: Uint8Array }[] = [];

  for (const name of FONT_CSS_FILES) {
    assets.push({
      fileName: `fonts/${name}`,
      source: fs.readFileSync(path.join(FONT_ROOT, name)),
    });
  }

  const filesDir = path.join(FONT_ROOT, 'files');
  for (const name of fs.readdirSync(filesDir)) {
    if (name.endsWith('.woff2')) {
      assets.push({
        fileName: `fonts/files/${name}`,
        source: fs.readFileSync(path.join(filesDir, name)),
      });
    }
  }

  return assets;
}

/**
 * Vite 插件：字体按需加载 + 离线可用。
 *
 * 开发模式：在 DEV_FONT 标记之间插入本地 node_modules 字体 CSS 链接。
 * 生产模式：在 PROD_FONT 标记之间插入打包后的本地字体 CSS 链接
 * （与 base 对齐），并把字体 CSS 与全部 woff2 子集 emit 到 dist/fonts/。
 *
 * 字体子集不进 SW 预缓存（避免首装 29MB 全量下载），
 * 而是由 runtimeCaching 按 CacheFirst 缓存，按需加载 + 离线可用。
 */
export function fontSwitch(mode: string): Plugin {
  const isDev = mode !== 'cf' && mode !== 'gh';
  let base = '/';

  return {
    name: 'font-switch',
    enforce: 'post',
    configResolved(config: ResolvedConfig) {
      base = config.base;
    },
    transformIndexHtml(html) {
      const devFontLink =
        '  <link rel="stylesheet" href="/node_modules/lxgw-wenkai-webfont/style.css" />';
      const prodFontLink = `  <link rel="stylesheet" href="${base}fonts/style.css" />`;

      const devFontPattern = /<!-- DEV_FONT_START -->[\s\S]*?<!-- DEV_FONT_END -->/;
      const prodFontPattern = /<!-- PROD_FONT_START -->[\s\S]*?<!-- PROD_FONT_END -->/;

      if (isDev) {
        return html.replace(
          devFontPattern,
          `<!-- DEV_FONT_START -->\n${devFontLink}\n<!-- DEV_FONT_END -->`
        );
      }

      return html.replace(
        prodFontPattern,
        `<!-- PROD_FONT_START -->\n${prodFontLink}\n<!-- PROD_FONT_END -->`
      );
    },
    generateBundle() {
      for (const asset of collectFontAssets()) {
        this.emitFile({ type: 'asset', fileName: asset.fileName, source: asset.source });
      }
    },
  };
}
