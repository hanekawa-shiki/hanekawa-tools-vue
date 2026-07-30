<script setup lang="ts">
import { ref } from 'vue';
import MonthPicker from '@/components/month-picker.vue';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MONTH_NAMES, WEEK_START_CONFIG } from './calendar-utils';

const props = defineProps<{
  year: number;
  month: number;
  weekStart: 0 | 6;
}>();

const emit = defineEmits<{
  (e: 'monthSelect', date: Date): void;
  (e: 'weekStartChange', val: string): void;
  (e: 'goToday'): void;
}>();

const open = ref(false);

const displayLabel = `${props.year} 年 · ${MONTH_NAMES[props.month]}`;

const handleMonthSelect = (date: Date) => {
  emit('monthSelect', date);
  open.value = false;
};
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-2">
    <div class="grid grid-cols-2 gap-2 lg:flex lg:flex-wrap lg:items-center lg:justify-center">
      <Popover v-model:open="open">
        <PopoverTrigger as-child>
          <Button variant="outline" size="sm" class="w-full gap-1.5 font-medium lg:w-auto">
            {{ displayLabel }}
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0">
          <MonthPicker
            :selected-month="new Date(year, month)"
            :on-month-select="handleMonthSelect"
          />
        </PopoverContent>
      </Popover>

      <Select
        :model-value="String(weekStart)"
        @update:model-value="(v) => emit('weekStartChange', String(v))"
      >
        <SelectTrigger class="w-full lg:w-auto">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="opt in WEEK_START_CONFIG" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" @click="emit('goToday')"> 回到今天 </Button>
    </div>
  </div>
</template>
