<script setup lang="ts">
import type parseTorrent from 'parse-torrent';
import dayjs from 'dayjs';
import { remote as parseTorrentRemote, toMagnetURI } from 'parse-torrent';
import { ref } from 'vue';
import { toast } from 'vue-sonner';
import Icon from '@/components/icon.vue';
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
      />
      <Button :disabled="loading" @click="fileInputRef?.click()">
        <Icon name="Upload01Icon" class="size-4" />
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
            <Icon name="File01Icon" class="size-4" />
            Torrent
          </div>
          <div class="space-y-2 rounded-lg border p-3">
            <div
              v-for="(t, index) in torrents"
              :key="`file-${t.fileName}`"
              class="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm"
            >
              <Icon name="File01Icon" class="size-4 shrink-0 text-muted-foreground" />
              <span class="min-w-0 flex-1 truncate">{{ t.fileName }}</span>
              <div
                title="删除"
                class="inline-flex size-4 shrink-0 cursor-pointer items-center justify-center text-muted-foreground hover:text-destructive"
                @click="handleRemoveItem(index)"
              >
                <Icon name="Delete01Icon" class="size-4" />
              </div>
            </div>
          </div>
          <div class="mt-2">
            <Button variant="outline" size="sm" @click="handleClearAll">
              <Icon name="Delete01Icon" class="size-4" />
              清除全部
            </Button>
          </div>
        </div>

        <div>
          <div class="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Icon name="Link01Icon" class="size-4" />
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
                <Icon v-if="copiedIndex === index" name="CheckIcon" class="size-4 text-green-600" />
                <Icon v-else name="Copy01Icon" class="size-4" />
              </div>
              <span class="min-w-0 flex-1 truncate text-sm">{{ t.magnet }}</span>
            </div>
          </div>

          <div class="mt-3 flex items-center gap-3">
            <Button variant="outline" size="sm" @click="handleExportToFile">
              <Icon name="Download01Icon" class="size-4" />
              导出内容到文件
            </Button>
            <Button variant="outline" size="sm" @click="handleCopyAll">
              <Icon name="Copy01Icon" class="size-4" />
              全部复制到剪切版
            </Button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
