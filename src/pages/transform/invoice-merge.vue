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
  { label: '每页 4 张（2×2）', value: 4 },
  { label: '每页 2 张（上下）', value: 2 },
];

interface InvoicePage {
  id: string;
  fileName: string;
  bytes: Uint8Array;
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
const dragId = ref<string | null>(null);
const previewModalVisible = ref(false);
const previewUrl = ref('');

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
      const previewDataUrl = await renderPreview(bytes);
      newInvoices.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        fileName: file.name,
        bytes,
        previewDataUrl,
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

// 基于原生 HTML5 Drag and Drop 的简单拖拽实现
const handleDragStart = (id: string) => {
  dragId.value = id;
};
const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
};
const handleDrop = (targetId: string) => {
  if (dragId.value === null || dragId.value === targetId) {
    return;
  }
  const arr = [...invoices.value];
  const fromIndex = arr.findIndex((inv) => inv.id === dragId.value);
  const toIndex = arr.findIndex((inv) => inv.id === targetId);
  if (fromIndex === -1 || toIndex === -1) {
    return;
  }
  const temp = arr[fromIndex];
  arr[fromIndex] = arr[toIndex];
  arr[toIndex] = temp;
  invoices.value = arr;
  dragId.value = null;
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
          const srcDoc = await PDFDocument.load(invoice.bytes);
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

const openPreview = (url: string) => {
  previewUrl.value = url;
  previewModalVisible.value = true;
};

const closePreview = () => {
  previewModalVisible.value = false;
  previewUrl.value = '';
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
      />
      <Button :disabled="loading" @click="fileInputRef?.click()">
        <Icon name="FileInputIcon" class="size-4" />
        {{ loading ? '读取中...' : '选择发票 PDF' }}
      </Button>

      <Select v-model="perPage" class="w-40">
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
          <Icon name="Delete01Icon" class="size-4" />
          清除全部
        </Button>
        <Button size="sm" :disabled="exporting" @click="handleExport">
          <Icon name="Download01Icon" class="size-4" />
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
              :class="dragId === inv.id ? 'scale-95 opacity-40' : ''"
              @dragstart="handleDragStart(inv.id)"
              @dragover="handleDragOver"
              @drop="handleDrop(inv.id)"
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
                <Icon name="Delete01Icon" class="size-3.5" />
              </div>
              <div
                class="relative h-48 w-full flex-1 cursor-pointer"
                @click="openPreview(inv.previewDataUrl!)"
              >
                <iframe
                  v-if="inv.previewDataUrl"
                  :src="inv.previewDataUrl"
                  class="pointer-events-none size-full border-0"
                  :title="inv.fileName"
                ></iframe>
                <div class="absolute inset-0"></div>
              </div>
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
      <Icon name="Layers01Icon" class="mb-4 size-12 opacity-40" />
      <p class="text-sm">选择多个发票 PDF 文件进行合并</p>
      <p class="mt-1 text-xs text-muted-foreground/70">
        仅提取每个 PDF 的第一页，自动缩放排列到 A4 页面上
      </p>
      <div
        class="mt-4 max-w-md rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-center dark:border-amber-700 dark:bg-amber-950/50"
      >
        <p class="text-xs text-amber-700 dark:text-amber-300">
          💡 建议单次选择不超过 50
          个文件。文件过大或过多可能导致浏览器响应变慢，可分批处理以获得更好的体验。
        </p>
      </div>
    </div>

    <!-- 预览模态框 -->
    <Teleport to="body">
      <div
        v-if="previewModalVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        @click.self="closePreview"
      >
        <div class="relative max-h-[90vh] max-w-[90vw]">
          <div
            title="关闭"
            class="absolute -top-10 right-0 inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
            @click="closePreview"
          >
            <Icon name="Cancel01Icon" class="size-5" />
          </div>
          <iframe
            v-if="previewUrl"
            :src="previewUrl"
            class="h-[85vh] w-[80vw] rounded-lg border-0 bg-white"
            title="发票预览"
          ></iframe>
        </div>
      </div>
    </Teleport>
  </div>
</template>
