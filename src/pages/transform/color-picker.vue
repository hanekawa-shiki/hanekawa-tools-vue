<script setup lang="ts">
import { computed, ref } from 'vue';
import { toast } from 'vue-sonner';
import PageHeader from '@/components/page-header.vue';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: Number.parseInt(h.substring(0, 2), 16),
    g: Number.parseInt(h.substring(2, 4), 16),
    b: Number.parseInt(h.substring(4, 6), 16),
  };
}

function rgbToHsl(r: number, g: number, b: number) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) {
      h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    } else if (max === gn) {
      h = ((bn - rn) / d + 2) / 6;
    } else {
      h = ((rn - gn) / d + 4) / 6;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToHsv(r: number, g: number, b: number) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) {
      h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    } else if (max === gn) {
      h = ((bn - rn) / d + 2) / 6;
    } else {
      h = ((rn - gn) / d + 4) / 6;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(max === 0 ? 0 : (d / max) * 100),
    v: Math.round(max * 100),
  };
}

function rgbToCmyk(r: number, g: number, b: number) {
  if (r === 0 && g === 0 && b === 0) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  return {
    c: Math.round(((1 - rn - k) / (1 - k)) * 100),
    m: Math.round(((1 - gn - k) / (1 - k)) * 100),
    y: Math.round(((1 - bn - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

function isValidHex(hex: string): boolean {
  return /^#?[0-9a-f]{6}$/i.test(hex);
}

function alphaToHex(alpha: number): string {
  return Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
}

const THEME_PRIMARY = '#008236';
const PRESET_COLORS = [
  '#FF0000',
  '#FF5722',
  '#FF9800',
  '#FFC107',
  '#FFEB3B',
  '#8BC34A',
  '#4CAF50',
  '#009688',
  '#00BCD4',
  '#03A9F4',
  '#2196F3',
  '#3F51B5',
  '#673AB7',
  '#9C27B0',
  '#E91E63',
  '#F44336',
  '#795548',
  '#607D8B',
  '#9E9E9E',
  '#000000',
  '#FFFFFF',
];

const hexInput = ref(THEME_PRIMARY);
const alpha = ref(100);

const isValid = computed(() => isValidHex(hexInput.value));
const normalizedHex = computed(() => {
  if (!isValid.value) {
    return THEME_PRIMARY;
  }
  return hexInput.value.startsWith('#') ? hexInput.value : `#${hexInput.value}`;
});
const rgb = computed(() => hexToRgb(normalizedHex.value));
const hsl = computed(() => rgbToHsl(rgb.value.r, rgb.value.g, rgb.value.b));
const hsv = computed(() => rgbToHsv(rgb.value.r, rgb.value.g, rgb.value.b));
const cmyk = computed(() => rgbToCmyk(rgb.value.r, rgb.value.g, rgb.value.b));
const alphaDecimal = computed(() => Math.round(alpha.value) / 100);

const copiedField = ref('');
const handleCopy = async (label: string, value: string) => {
  await navigator.clipboard.writeText(value);
  copiedField.value = label;
  toast.success(`${label} 已复制`);
  setTimeout(() => {
    copiedField.value = '';
  }, 1500);
};
</script>

<template>
  <div class="size-full">
    <PageHeader />
    <div class="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div class="space-y-4">
        <Card class="p-4">
          <div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Icon name="ColorPickerIcon" class="size-4" />
            取色器
          </div>
          <div class="mt-3 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <input
              type="color"
              :value="normalizedHex"
              class="size-40 cursor-pointer rounded-lg border-0 p-0"
              @input="hexInput = ($event.target as HTMLInputElement).value.toUpperCase()"
            />
            <div class="flex flex-1 flex-col gap-3">
              <div class="relative h-20 w-full overflow-hidden rounded-lg border shadow-sm">
                <div
                  class="absolute inset-0"
                  style="
                    background-image:
                      linear-gradient(45deg, #ccc 25%, transparent 25%),
                      linear-gradient(-45deg, #ccc 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, #ccc 75%),
                      linear-gradient(-45deg, transparent 75%, #ccc 75%);
                    background-size: 12px 12px;
                    background-position:
                      0 0,
                      0 6px,
                      6px -6px,
                      -6px 0;
                  "
                ></div>
                <div
                  class="absolute inset-0"
                  :style="{
                    backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alphaDecimal})`,
                  }"
                ></div>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-10 text-sm font-medium text-muted-foreground">HEX</span>
                <Input
                  v-model="hexInput"
                  class="flex-1 font-mono uppercase"
                  :class="!isValid ? 'border-destructive' : ''"
                  :maxlength="7"
                  placeholder="#000000"
                />
              </div>
              <p v-if="!isValid" class="text-xs text-destructive">
                请输入有效的 HEX 颜色值，例如 #FF5722
              </p>
              <div class="flex items-center gap-2">
                <span class="w-10 text-sm font-medium text-muted-foreground">透明</span>
                <div class="flex flex-1 items-center gap-2">
                  <input
                    v-model.number="alpha"
                    type="range"
                    :min="0"
                    :max="100"
                    class="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-foreground"
                  />
                  <span class="w-10 text-right text-sm text-muted-foreground tabular-nums">
                    {{ alpha }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
        <Card class="p-4">
          <div class="text-sm font-medium text-muted-foreground">常用颜色</div>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="color in PRESET_COLORS"
              :key="color"
              type="button"
              class="size-8 cursor-pointer rounded-md border-2 transition-transform hover:scale-110"
              :class="
                normalizedHex.toUpperCase() === color.toUpperCase()
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-border'
              "
              :style="{ backgroundColor: color }"
              :title="color"
              @click="hexInput = color.toUpperCase()"
            ></button>
          </div>
        </Card>
      </div>
      <div>
        <Card class="p-4">
          <div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Icon name="Copy01Icon" class="size-4" />
            颜色代码
          </div>
          <div class="mt-3 space-y-3">
            <div
              v-for="(item, idx) in [
                { label: 'HEX', value: normalizedHex.toUpperCase() },
                {
                  label: 'HEXA',
                  value: `${normalizedHex.toUpperCase()}${alphaToHex(alphaDecimal)}`,
                },
                { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
                { label: 'RGBA', value: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alphaDecimal})` },
                { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
                { label: 'HSLA', value: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alphaDecimal})` },
                { label: 'HSV', value: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)` },
                { label: 'CMYK', value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
              ]"
              :key="idx"
              class="flex items-center gap-2"
            >
              <span class="w-16 shrink-0 text-sm font-medium text-muted-foreground">{{
                item.label
              }}</span>
              <div
                class="flex min-w-0 flex-1 items-center gap-2 rounded-md border bg-muted/50 px-3 py-2"
              >
                <code class="min-w-0 flex-1 truncate text-sm">{{ item.value }}</code>
                <button
                  type="button"
                  title="复制"
                  class="inline-flex shrink-0 cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground"
                  @click="handleCopy(item.label, item.value)"
                >
                  <Icon
                    v-if="copiedField === item.label"
                    name="CheckIcon"
                    class="size-4 text-green-600"
                  />
                  <Icon v-else name="Copy01Icon" class="size-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>
