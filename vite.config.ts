import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';
import viteCompression from 'vite-plugin-compression';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';
import { fontSwitch } from './vite-plugins/fontSwitch.ts';
import htmlBuildTime from './vite-plugins/htmlBuildTime.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const envDir = path.resolve(__dirname, 'env');
  const env = loadEnv(mode, envDir, '');

  return {
    envDir: 'env',
    plugins: [
      tailwindcss(),
      vue(),
      nodePolyfills({
        include: ['path'],
      }),
      htmlBuildTime(),
      fontSwitch(mode),
      VitePWA({
        registerType: 'prompt',
        includeAssets: ['avatar.jpeg'],
        manifest: {
          name: 'Hanekawa Tools',
          short_name: 'Hanekawa',
          description: '中文日常小工具集合',
          theme_color: '#ffffff',
          icons: [
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,ico,png,svg,woff2}'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'pages',
              },
            },
            {
              urlPattern: /^https:\/\/tools\.hanekawa\.top\/api\//i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 3600,
                },
              },
            },
          ],
        },
      }),

      ...(mode !== 'cf'
        ? [
            viteCompression({
              algorithm: 'brotliCompress',
              compressionOptions: { level: 11 },
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 9090,
      host: true,
      open: true,
      proxy: {
        '/api': {
          target: 'https://tools.hanekawa.top',
          changeOrigin: true,
          secure: true,
          headers: {
            Origin: 'https://tools.hanekawa.top',
          },
        },
      },
    },
    base: env.VITE_BASE_PATH || '/',
    build: {
      emptyOutDir: true,
      outDir: env.VITE_OUT_DIR || 'dist',
      reportCompressedSize: true,
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'vendor-vue',
                test: /node_modules[\\/](?:vue|vue-router|@vueuse)[\\/]/,
              },
              {
                name: 'vendor-reka',
                test: /node_modules[\\/]reka-ui[\\/]/,
              },
              {
                name: 'vendor-pdf',
                test: /node_modules[\\/]pdf-lib[\\/]/,
              },
              {
                name: 'vendor-sortable',
                test: /node_modules[\\/](?:sortablejs|vuedraggable)[\\/]/,
              },
              {
                name: 'vendor-date',
                test: /node_modules[\\/](?:dayjs|lunisolar)[\\/]/,
              },
              {
                name: 'vendor-icons',
                test: /node_modules[\\/]@hugeicons[\\/]/,
              },
              {
                name: 'vendor-torrent',
                test: /node_modules[\\/]parse-torrent[\\/]/,
              },
              {
                name: 'vendor-tanstack',
                test: /node_modules[\\/]@tanstack[\\/]/,
              },
            ],
          },
        },
      },
    },
  };
});
