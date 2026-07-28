<script setup lang="ts">
import Fuse from 'fuse.js';
import mimeDb from 'mime-db';
import { computed, ref } from 'vue';
import PageHeader from '@/components/page-header.vue';
import { Input } from '@/components/ui/input';

interface MediaTypeEntry {
  type: string;
  source?: string;
  charset?: string;
  compressible?: boolean;
  extensions?: string[];
}

interface MediaTypeItem {
  mime: string;
  source: string;
  charset: string;
  compressible: string;
  extensions: string[];
  extensionDisplay: string;
}

const sourceLabels: Record<string, string> = { iana: 'IANA', apache: 'Apache', nginx: 'Nginx' };

function buildMediaTypeList(): MediaTypeItem[] {
  const db = mimeDb as Record<string, MediaTypeEntry>;
  return Object.entries(db)
    .map(([mime, entry]) => ({
      mime,
      source: sourceLabels[entry.source ?? ''] ?? entry.source ?? '-',
      charset: entry.charset ?? '-',
      compressible: entry.compressible === true ? '是' : entry.compressible === false ? '否' : '-',
      extensions: entry.extensions ?? [],
      extensionDisplay: (entry.extensions ?? []).map((ext) => `.${ext}`).join(', ') || '-',
    }))
    .sort((a, b) => a.mime.localeCompare(b.mime));
}

const ALL_ITEMS = buildMediaTypeList();

const fuse = new Fuse(ALL_ITEMS, {
  keys: [
    { name: 'mime', weight: 0.5 },
    { name: 'extensions', weight: 0.3 },
    { name: 'extensionDisplay', weight: 0.2 },
  ],
  threshold: 0.35,
  includeScore: true,
});

const query = ref('');
const results = computed(() => {
  const trimmed = query.value.trim();
  if (trimmed === '') {
    return ALL_ITEMS;
  }
  return fuse.search(trimmed).map((r) => r.item);
});

const parentRef = ref<HTMLDivElement | null>(null);
const scrollTop = ref(0);
const itemHeight = 56;
const overscan = 10;

const visibleRange = computed(() => {
  if (!parentRef.value) {
    return { start: 0, end: Math.min(results.value.length, 50) };
  }
  const containerHeight = parentRef.value.clientHeight;
  const start = Math.max(0, Math.floor(scrollTop.value / itemHeight) - overscan);
  const end = Math.min(
    results.value.length,
    Math.ceil((scrollTop.value + containerHeight) / itemHeight) + overscan
  );
  return { start, end };
});

const totalHeight = computed(() => results.value.length * itemHeight);

const handleScroll = (e: Event) => {
  scrollTop.value = (e.target as HTMLDivElement).scrollTop;
};
</script>

<template>
  <div class="flex size-full flex-col">
    <PageHeader />
    <div class="sticky top-0 z-10 -mx-4 bg-background px-4 pt-2 pb-3 lg:mx-0 lg:px-0">
      <div class="relative">
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
          class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <Input
          v-model="query"
          placeholder="搜索 MIME 类型或文件后缀，如 application/pdf、.mp4、json..."
          class="pl-9"
        />
      </div>
      <div class="mt-2 text-xs text-muted-foreground">
        共 {{ ALL_ITEMS.length }} 种媒体类型
        <template v-if="query.trim() !== ''">
          ，匹配 {{ results.length }} 条
        </template>
      </div>
    </div>

    <template v-if="results.length === 0">
      <div class="flex flex-1 items-center justify-center py-20 text-sm text-muted-foreground">
        未找到匹配的媒体类型
      </div>
    </template>
    <template v-else>
      <div
        ref="parentRef"
        class="min-h-0 flex-1 overflow-auto rounded-lg border"
        @scroll="handleScroll"
      >
        <div
          class="sticky top-0 z-10 flex items-center border-b bg-muted/80 text-xs font-medium text-muted-foreground backdrop-blur-sm"
        >
          <div class="w-100 shrink-0 px-4 py-2">
            MIME 类型
          </div>
          <div class="hidden w-35 shrink-0 px-4 py-2 sm:block">
            文件后缀
          </div>
          <div class="hidden w-20 shrink-0 px-4 py-2 md:block">
            来源
          </div>
          <div class="hidden w-20 shrink-0 px-4 py-2 lg:block">
            字符集
          </div>
          <div class="hidden w-20 shrink-0 px-4 py-2 lg:block">
            可压缩
          </div>
        </div>
        <div :style="{ height: `${totalHeight}px`, width: '100%', position: 'relative' }">
          <div
            v-for="virtualRow in results.slice(visibleRange.start, visibleRange.end)"
            :key="virtualRow.mime"
            :style="{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${itemHeight}px`,
              transform: `translateY(${results.indexOf(virtualRow) * itemHeight}px)`,
            }"
            class="flex items-center border-b text-sm transition-colors hover:bg-muted/50"
          >
            <div class="flex w-100 shrink-0 items-center gap-2 overflow-hidden px-4 py-3">
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
              <span class="truncate font-mono text-xs">{{ virtualRow.mime }}</span>
            </div>
            <div
              class="hidden w-35 shrink-0 truncate px-4 py-3 text-xs text-muted-foreground sm:block"
            >
              {{ virtualRow.extensionDisplay }}
            </div>
            <div class="hidden w-20 shrink-0 px-4 py-3 text-xs text-muted-foreground md:block">
              {{ virtualRow.source }}
            </div>
            <div class="hidden w-20 shrink-0 px-4 py-3 text-xs text-muted-foreground lg:block">
              {{ virtualRow.charset }}
            </div>
            <div class="hidden w-20 shrink-0 px-4 py-3 text-xs text-muted-foreground lg:block">
              {{ virtualRow.compressible }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
