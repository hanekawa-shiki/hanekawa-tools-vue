<script setup lang="ts">
import type parseTorrent from 'parse-torrent';
import dayjs from 'dayjs';
import { remote as parseTorrentRemote, toMagnetURI } from 'parse-torrent';
import { ref } from 'vue';
import { toast } from 'vue-sonner';
import PageHeader from '@/components/page-header.vue';
import { Button } from '@/components/ui/button';

const MAX_FILES = 100;

async function parseTorrentFile(file: File): Promise<parseTorrent.Instance> {
  return new Promise((resolve, reject) => {
    parseTorrentRemote(file, (err, torrent) => {
      if (err !== undefined && err !== null) {
        reject(err);
      } else if (torrent === undefined || torrent === null) {
        reject(new Error('Invalid torrent file'));
      } else {
        resolve(torrent);
      }
    });
  });
}

const fileInputRef = ref<HTMLInputElement | null>(null);
const torrents = ref<TorrentInfo[]>([]);
const loading = ref(false);
const errorMsg = ref('');

const handleFileSelect = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const files = input.files;
  if (!files || files.length === 0) {
    return;
  }

  if (files.length > MAX_FILES) {
    errorMsg.value = `单次最多允许选择 ${MAX_FILES} 个文件，当前已选择 ${files.length} 个`;
    return;
  }

  errorMsg.value = '';
  loading.value = true;
  const results: TorrentInfo[] = [];

  for (const file of Array.from(files)) {
    try {
      const torrent = await parseTorrentFile(file);
      const magnet = toMagnetURI(torrent);
      results.push({ fileName: file.name, magnet });
    } catch {
      results.push({ fileName: file.name, magnet: `[解析失败] ${file.name}` });
      toast.error(`解析失败：${file.name}`);
    }
  }

  torrents.value = results;
  loading.value = false;

  if (results.length > 0) {
    const failedCount = results.filter((t) => t.magnet.startsWith('[解析失败]')).length;
    if (failedCount === 0) {
      toast.success(`成功解析 ${results.length} 个文件`);
    } else if (failedCount < results.length) {
      toast.warning(`部分解析成功：${results.length - failedCount} 成功，${failedCount} 失败`);
    }
  }

  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const handleRemoveItem = (index: number) => {
  torrents.value = torrents.value.filter((_, i) => i !== index);
};

const handleClearAll = () => {
  torrents.value = [];
  toast.info('已清除全部 Torrent');
};

const handleExportToFile = () => {
  const content = torrents.value.map((t) => t.magnet).join('\n');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `magnets_${dayjs().format('YYYYMMDDHHmmss')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success('已导出磁力链接文件');
};

const handleCopyAll = async () => {
  const content = torrents.value.map((t) => t.magnet).join('\n');
  try {
    await navigator.clipboard.writeText(content);
    toast.success('已复制全部磁力链接');
  } catch {
    toast.error('复制失败');
  }
};

const copiedIndex = ref<number | null>(null);
const handleCopy = async (text: string, index: number) => {
  await navigator.clipboard.writeText(text);
  copiedIndex.value = index;
  setTimeout(() => {
    copiedIndex.value = null;
  }, 1500);
};
</script>

<template>
  <div class="size-full">
    <PageHeader />
    <div class="mt-4 flex items-center gap-3">
      <input
        ref="fileInputRef"
        type="file"
        accept=".torrent"
        multiple
        class="hidden"
        @change="handleFileSelect"
      >
      <Button size="lg" :disabled="loading" @click="fileInputRef?.click()">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="size-4"
        >
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" x2="3" y1="12" y2="12" />
        </svg>
        {{ loading ? '解析中...' : '选择Torrent文件' }}
      </Button>
      <span v-if="torrents.length > 0" class="text-sm text-muted-foreground">
        已选择 {{ torrents.length }} 个文件
      </span>
    </div>

    <div v-if="errorMsg" class="mt-2 text-sm text-destructive">
      {{ errorMsg }}
    </div>

    <template v-if="torrents.length > 0">
      <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <div class="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="size-4"
            >
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            </svg>
            Torrent
          </div>
          <div class="space-y-2 rounded-lg border p-3">
            <div
              v-for="(t, index) in torrents"
              :key="`file-${t.fileName}`"
              class="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="size-4 shrink-0 text-muted-foreground"
              >
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              </svg>
              <span class="min-w-0 flex-1 truncate">{{ t.fileName }}</span>
              <div
                title="删除"
                class="inline-flex size-4 shrink-0 cursor-pointer items-center justify-center text-muted-foreground hover:text-destructive"
                @click="handleRemoveItem(index)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="size-4"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </div>
            </div>
          </div>
          <div class="mt-2">
            <Button variant="outline" size="sm" @click="handleClearAll">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="size-4"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
              清除全部
            </Button>
          </div>
        </div>

        <div>
          <div class="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="size-4"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Magnet
          </div>
          <div class="space-y-2 rounded-lg border p-3">
            <div
              v-for="(t, index) in torrents"
              :key="`magnet-${t.magnet}`"
              class="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm"
            >
              <div
                title="复制"
                class="inline-flex size-4 shrink-0 cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground"
                @click="handleCopy(t.magnet, index)"
              >
                <svg
                  v-if="copiedIndex === index"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="size-4 text-green-600"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="size-4"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              </div>
              <span class="min-w-0 flex-1 truncate text-sm">{{ t.magnet }}</span>
            </div>
          </div>

          <div class="mt-3 flex items-center gap-3">
            <Button variant="outline" size="sm" @click="handleExportToFile">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="size-4"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              导出内容到文件
            </Button>
            <Button variant="outline" size="sm" @click="handleCopyAll">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="size-4"
              >
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              全部复制到剪切版
            </Button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
