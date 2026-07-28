<script setup lang="ts">
import { PDFDocument } from 'pdf-lib';
import { computed, ref } from 'vue';
import { toast } from 'vue-sonner';
import PageHeader from '@/components/page-header.vue';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const A4_LANDSCAPE_WIDTH = 841.89;
const A4_LANDSCAPE_HEIGHT = 595.28;
const MARGIN = 12;
const MAX_FILES = 50;

const PER_PAGE_CONFIG = [
  { label: '每页 4 张（2×2）', value: '4' },
  { label: '每页 2 张（上下）', value: '2' },
];

interface InvoicePage {
  id: string;
  fileName: string;
  file: File;
  previewDataUrl?: string;
}

async function renderPreview(pdfBytes: Uint8Array): Promise<string> {
  const srcDoc = await PDFDocument.load(pdfBytes);
  const newDoc = await PDFDocument.create();
  const [copied] = await newDoc.copyPages(srcDoc, [0]);
  newDoc.addPage(copied);
  const savedBytes = await newDoc.save();
  const blob = new Blob([new Uint8Array(savedBytes)], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}

async function readFileAsArrayBuffer(file: File): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer();
  return new Uint8Array(buffer);
}

function getLayoutSlots(perPage: 2 | 4) {
  if (perPage === 4) {
    const slotW = (A4_LANDSCAPE_WIDTH - MARGIN * 3) / 2;
    const slotH = (A4_LANDSCAPE_HEIGHT - MARGIN * 3) / 2;
    return [
      { x: MARGIN, y: slotH + MARGIN * 2, maxW: slotW, maxH: slotH },
      { x: slotW + MARGIN * 2, y: slotH + MARGIN * 2, maxW: slotW, maxH: slotH },
      { x: MARGIN, y: MARGIN, maxW: slotW, maxH: slotH },
      { x: slotW + MARGIN * 2, y: MARGIN, maxW: slotW, maxH: slotH },
    ];
  }
  const slotH = (A4_HEIGHT - MARGIN * 3) / 2;
  return [
    { x: MARGIN, y: slotH + MARGIN * 2, maxW: A4_WIDTH - MARGIN * 2, maxH: slotH },
    { x: MARGIN, y: MARGIN, maxW: A4_WIDTH - MARGIN * 2, maxH: slotH },
  ];
}

const fileInputRef = ref<HTMLInputElement | null>(null);
const invoices = ref<InvoicePage[]>([]);
const perPage = ref<2 | 4>(4);
const loading = ref(false);
const exporting = ref(false);
const dragIndex = ref<number | null>(null);

const totalPages = computed(() =>
  invoices.value.length === 0 ? 0 : Math.ceil(invoices.value.length / perPage.value)
);

const handleFileSelect = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const files = input.files;
  if (!files || files.length === 0) {
    return;
  }

  if (files.length > MAX_FILES) {
    toast.warning(`单次最多选择 ${MAX_FILES} 个文件，当前选择了 ${files.length} 个`);
    return;
  }

  loading.value = true;
  for (const inv of invoices.value) {
    if (inv.previewDataUrl) {
      URL.revokeObjectURL(inv.previewDataUrl);
    }
  }
  invoices.value = [];
  const newInvoices: InvoicePage[] = [];

  for (const file of Array.from(files)) {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.warning(`跳过非 PDF 文件：${file.name}`);
      continue;
    }
    try {
      const bytes = await readFileAsArrayBuffer(file);
      const previewUrl = await renderPreview(bytes);
      newInvoices.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        fileName: file.name,
        file,
        previewDataUrl: previewUrl,
      });
    } catch {
      toast.error(`读取失败：${file.name}`);
    }
  }

  invoices.value = [...invoices.value, ...newInvoices];
  loading.value = false;
  if (newInvoices.length > 0) {
    toast.success(`已添加 ${newInvoices.length} 个发票`);
  }
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const handleRemoveItem = (index: number) => {
  const removed = invoices.value[index];
  if (removed?.previewDataUrl) {
    URL.revokeObjectURL(removed.previewDataUrl);
  }
  invoices.value = invoices.value.filter((_, i) => i !== index);
};

const handleClearAll = () => {
  for (const inv of invoices.value) {
    if (inv.previewDataUrl) {
      URL.revokeObjectURL(inv.previewDataUrl);
    }
  }
  invoices.value = [];
  toast.info('已清除全部发票');
};

// Simple drag-and-drop using native HTML5 drag
const handleDragStart = (index: number) => {
  dragIndex.value = index;
};
const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
};
const handleDrop = (targetIndex: number) => {
  if (dragIndex.value === null || dragIndex.value === targetIndex) {
    return;
  }
  const arr = [...invoices.value];
  const [moved] = arr.splice(dragIndex.value, 1);
  arr.splice(targetIndex, 0, moved);
  invoices.value = arr;
  dragIndex.value = null;
};

const handleExport = async () => {
  if (invoices.value.length === 0) {
    toast.warning('请先添加发票');
    return;
  }
  exporting.value = true;
  try {
    const mergedDoc = await PDFDocument.create();
    const slots = getLayoutSlots(perPage.value);
    const slotCount = slots.length;
    const pages = Math.ceil(invoices.value.length / slotCount);

    for (let pageIdx = 0; pageIdx < pages; pageIdx++) {
      const isLandscape = perPage.value === 4;
      const pageW = isLandscape ? A4_LANDSCAPE_WIDTH : A4_WIDTH;
      const pageH = isLandscape ? A4_LANDSCAPE_HEIGHT : A4_HEIGHT;
      const page = mergedDoc.addPage([pageW, pageH]);
      const startIdx = pageIdx * slotCount;

      for (
        let slotIdx = 0;
        slotIdx < Math.min(slotCount, invoices.value.length - startIdx);
        slotIdx++
      ) {
        const invoice = invoices.value[startIdx + slotIdx];
        const slot = slots[slotIdx];
        try {
          const pdfBytes = await readFileAsArrayBuffer(invoice.file);
          const srcDoc = await PDFDocument.load(pdfBytes);
          const [embeddedPage] = await mergedDoc.embedPdf(srcDoc, [0]);
          const origPage = srcDoc.getPage(0);
          const { width: origW, height: origH } = origPage.getSize();
          const scale = Math.min(slot.maxW / origW, slot.maxH / origH);
          const scaledW = origW * scale;
          const scaledH = origH * scale;
          page.drawPage(embeddedPage, {
            x: slot.x + (slot.maxW - scaledW) / 2,
            y: slot.y + (slot.maxH - scaledH) / 2,
            width: scaledW,
            height: scaledH,
          });
        } catch {
          toast.error(`合并失败：${invoice.fileName}`);
        }
      }
    }

    const pdfBytes = await mergedDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `merged-invoices-${new Date().toISOString().slice(0, 10)}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('导出成功');
  } catch {
    toast.error('导出失败');
  } finally {
    exporting.value = false;
  }
};
</script>

<template>
  <div class="size-full">
    <PageHeader />
    <div class="mt-4 flex flex-wrap items-center gap-3">
      <input
        ref="fileInputRef"
        type="file"
        accept=".pdf"
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
        {{ loading ? '读取中...' : '选择发票 PDF' }}
      </Button>

      <Select
        :model-value="String(perPage)"
        class="w-40"
        @update:model-value="
          (v) => {
            if (v) perPage = Number(v) as 2 | 4;
          }
        "
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="opt in PER_PAGE_CONFIG" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <template v-if="invoices.length > 0">
        <span class="text-sm text-muted-foreground">
          {{ invoices.length }} 张发票，共 {{ totalPages }} 页
        </span>
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
        <Button size="sm" :disabled="exporting" @click="handleExport">
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
          {{ exporting ? '导出中...' : '导出合并 PDF' }}
        </Button>
      </template>
    </div>

    <template v-if="invoices.length > 0">
      <div class="mt-6 space-y-4">
        <div v-for="pageIdx in totalPages" :key="`page-${pageIdx}`">
          <div class="mb-2 text-xs font-medium text-muted-foreground">
            第 {{ pageIdx }} 页（{{
              Math.min(perPage, invoices.length - (pageIdx - 1) * perPage)
            }}/{{ perPage }}）
          </div>
          <div
            class="grid gap-3"
            :class="perPage === 2 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'"
          >
            <div
              v-for="(inv, slotIdx) in invoices.slice((pageIdx - 1) * perPage, pageIdx * perPage)"
              :key="inv.id"
              draggable="true"
              class="group relative flex cursor-grab flex-col items-center overflow-hidden rounded-lg border bg-muted/30 p-2 transition-all"
              :class="dragIndex === (pageIdx - 1) * perPage + slotIdx ? 'scale-95 opacity-40' : ''"
              @dragstart="handleDragStart((pageIdx - 1) * perPage + slotIdx)"
              @dragover="handleDragOver"
              @drop="handleDrop((pageIdx - 1) * perPage + slotIdx)"
            >
              <div
                class="absolute top-1 left-1 z-10 rounded bg-primary/80 px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground"
              >
                #{{ (pageIdx - 1) * perPage + slotIdx + 1 }}
              </div>
              <div
                title="删除"
                class="absolute top-1 right-1 z-10 inline-flex size-5 cursor-pointer items-center justify-center rounded-sm bg-background/80 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                @click="handleRemoveItem((pageIdx - 1) * perPage + slotIdx)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </div>
              <iframe
                v-if="inv.previewDataUrl"
                :src="inv.previewDataUrl"
                class="pointer-events-none h-48 w-full flex-1 border-0"
                :title="inv.fileName"
              />
              <span class="mt-1 w-full truncate text-center text-xs text-muted-foreground">{{
                inv.fileName
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div
      v-if="invoices.length === 0 && !loading"
      class="mt-16 flex flex-col items-center justify-center text-muted-foreground"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="mb-4 size-12 opacity-40"
      >
        <path
          d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"
        />
        <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
        <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
      </svg>
      <p class="text-sm">
        选择多个发票 PDF 文件进行合并
      </p>
      <p class="mt-1 text-xs text-muted-foreground/70">
        仅提取每个 PDF 的第一页，自动缩放排列到 A4 页面上
      </p>
      <div
        class="mt-4 max-w-md rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-center dark:border-amber-700 dark:bg-amber-950/50"
      >
        <p class="text-xs text-amber-700 dark:text-amber-300">
          建议单次选择不超过 50
          个文件。文件过大或过多可能导致浏览器响应变慢，可分批处理以获得更好的体验。
        </p>
      </div>
    </div>
  </div>
</template>
