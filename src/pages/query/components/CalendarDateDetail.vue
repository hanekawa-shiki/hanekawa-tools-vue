<script setup lang="ts">
import dayjs from 'dayjs';
import { computed } from 'vue';
import { getHolidayInfo } from '@/data/holidays';
import { getLunarFullInfo, getWeekOfYear } from './calendar-utils';

const props = defineProps<{
  selectedDate: string | null;
  holidaysLoaded?: number;
}>();

const date = computed(() => (props.selectedDate ? dayjs(props.selectedDate) : null));

const holidayInfo = computed(() => {
  void props.holidaysLoaded;
  if (!date.value) {
    return undefined;
  }
  return getHolidayInfo(date.value.month(), date.value.date(), date.value.year());
});

const lunarInfo = computed(() =>
  props.selectedDate ? getLunarFullInfo(props.selectedDate) : null
);
const weekOfYear = computed(() => (props.selectedDate ? getWeekOfYear(props.selectedDate) : 0));
const day = computed(() => date.value?.date() ?? 0);
const yearMonthText = computed(() =>
  date.value ? `${date.value.year()}年${date.value.month() + 1}月` : ''
);
const isRedDate = computed(() => {
  if (!date.value) {
    return false;
  }
  const hi = holidayInfo.value;
  const isWeekend = date.value.day() === 0 || date.value.day() === 6;
  const isWorkday = hi?.isWorkday === true;
  const isHoliday = hi !== undefined && !isWorkday;
  return isHoliday || (isWeekend && !isWorkday);
});
const isHoliday = computed(
  () => holidayInfo.value !== undefined && holidayInfo.value.isWorkday !== true
);
const isCompensatoryWorkday = computed(() => holidayInfo.value?.isWorkday === true);
</script>

<template>
  <div
    v-if="!selectedDate"
    class="flex h-full items-center justify-center text-sm text-muted-foreground"
  >
    请在日历中选择一个日期
  </div>
  <div v-else class="flex flex-col gap-4 p-4">
    <div class="flex items-center gap-3">
      <span class="text-3xl font-bold" :class="isRedDate ? 'text-red-500 dark:text-red-400' : ''">
        {{ day }}
      </span>
      <div class="flex flex-col">
        <span class="text-sm text-muted-foreground">
          {{ yearMonthText }}
        </span>
      </div>
    </div>

    <div class="rounded-lg bg-muted/50 p-3">
      <div class="mb-1 text-xs font-medium text-muted-foreground">农历</div>
      <div class="text-sm font-medium">
        {{ lunarInfo?.fullText }}
      </div>
      <div class="text-sm font-medium">
        {{ lunarInfo?.sbFullText }}
      </div>
    </div>

    <div class="rounded-lg bg-muted/50 p-3">
      <div class="mb-1 text-xs font-medium text-muted-foreground">周数</div>
      <div class="text-sm font-medium">当前为{{ date?.year() }}年的第{{ weekOfYear }}周</div>
    </div>

    <div v-if="isHoliday" class="rounded-lg bg-red-50 p-3 dark:bg-red-950">
      <div class="mb-1 text-xs font-medium text-red-400">节假日</div>
      <div class="text-sm font-medium text-red-600 dark:text-red-400">
        {{ holidayInfo?.name }}
      </div>
    </div>

    <div v-if="lunarInfo?.solarTerm" class="rounded-lg bg-green-50 p-3 dark:bg-green-950">
      <div class="mb-1 text-xs font-medium text-green-600 dark:text-green-400">节气</div>
      <div class="text-sm font-medium text-green-700 dark:text-green-400">
        {{ lunarInfo.solarTerm }}
      </div>
    </div>

    <div v-if="isCompensatoryWorkday" class="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
      <div class="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">调休上班</div>
      <div class="text-sm font-medium text-gray-600 dark:text-gray-400">
        {{ holidayInfo?.name }}
      </div>
    </div>
  </div>
</template>
