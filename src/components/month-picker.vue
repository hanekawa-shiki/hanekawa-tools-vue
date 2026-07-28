<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  selectedMonth?: Date;
  onMonthSelect?: (date: Date) => void;
}>();

const currentYear = computed(() => props.selectedMonth?.getFullYear() ?? new Date().getFullYear());

const months = [
  '一月',
  '二月',
  '三月',
  '四月',
  '五月',
  '六月',
  '七月',
  '八月',
  '九月',
  '十月',
  '十一月',
  '十二月',
];

const selectMonth = (index: number) => {
  props.onMonthSelect?.(new Date(currentYear.value, index, 1));
};
</script>

<template>
  <div class="grid grid-cols-3 gap-1 p-1">
    <button
      v-for="(month, index) in months"
      :key="index"
      class="flex h-9 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
      :class="[
        selectedMonth?.getFullYear() === currentYear && selectedMonth?.getMonth() === index
          ? 'bg-primary text-primary-foreground'
          : '',
      ]"
      @click="selectMonth(index)"
    >
      {{ month }}
    </button>
  </div>
</template>
