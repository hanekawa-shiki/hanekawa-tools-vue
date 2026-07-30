<script setup lang="ts">
import dayjs from 'dayjs';
import { getHolidayInfo } from '@/data/holidays';
import { getLunarFullInfo, getWeekOfYear } from './calendar-utils';

defineProps<{
  selectedDate: string | null;
  holidaysLoaded?: number;
}>();
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
      <span
        class="text-3xl font-bold"
        :class="
          (() => {
            const date = dayjs(selectedDate);
            const holidayInfo = getHolidayInfo(date.month(), date.date(), date.year());
            const dayOfWeek = date.day();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isWorkday = holidayInfo?.isWorkday === true;
            const isHoliday = holidayInfo !== undefined && !isWorkday;
            return isHoliday || (isWeekend && !isWorkday) ? 'text-red-500 dark:text-red-400' : '';
          })()
        "
      >{{ dayjs(selectedDate).date() }}</span>
      <div class="flex flex-col">
        <span class="text-sm text-muted-foreground">
          {{ dayjs(selectedDate).year() }}年{{ dayjs(selectedDate).month() + 1 }}月
        </span>
      </div>
    </div>

    <div class="rounded-lg bg-muted/50 p-3">
      <div class="mb-1 text-xs font-medium text-muted-foreground">农历</div>
      <div class="text-sm font-medium">
        {{ getLunarFullInfo(selectedDate).fullText }}
      </div>
      <div class="text-sm font-medium">
        {{ getLunarFullInfo(selectedDate).sbFullText }}
      </div>
    </div>

    <div class="rounded-lg bg-muted/50 p-3">
      <div class="mb-1 text-xs font-medium text-muted-foreground">周数</div>
      <div class="text-sm font-medium">
        当前为{{ dayjs(selectedDate).year() }}年的第{{ getWeekOfYear(selectedDate) }}周
      </div>
    </div>

    <div
      v-if="
        (() => {
          const hi = getHolidayInfo(
            dayjs(selectedDate).month(),
            dayjs(selectedDate).date(),
            dayjs(selectedDate).year()
          );
          return hi && hi.isWorkday !== true;
        })()
      "
      class="rounded-lg bg-red-50 p-3 dark:bg-red-950"
    >
      <div class="mb-1 text-xs font-medium text-red-400">节假日</div>
      <div class="text-sm font-medium text-red-600 dark:text-red-400">
        {{
          getHolidayInfo(
            dayjs(selectedDate).month(),
            dayjs(selectedDate).date(),
            dayjs(selectedDate).year()
          )?.name
        }}
      </div>
    </div>

    <div
      v-if="getLunarFullInfo(selectedDate).solarTerm"
      class="rounded-lg bg-green-50 p-3 dark:bg-green-950"
    >
      <div class="mb-1 text-xs font-medium text-green-600 dark:text-green-400">节气</div>
      <div class="text-sm font-medium text-green-700 dark:text-green-400">
        {{ getLunarFullInfo(selectedDate).solarTerm }}
      </div>
    </div>

    <div
      v-if="
        (() => {
          const hi = getHolidayInfo(
            dayjs(selectedDate).month(),
            dayjs(selectedDate).date(),
            dayjs(selectedDate).year()
          );
          return hi?.isWorkday === true;
        })()
      "
      class="rounded-lg bg-gray-50 p-3 dark:bg-gray-900"
    >
      <div class="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">调休上班</div>
      <div class="text-sm font-medium text-gray-600 dark:text-gray-400">
        {{
          getHolidayInfo(
            dayjs(selectedDate).month(),
            dayjs(selectedDate).date(),
            dayjs(selectedDate).year()
          )?.name
        }}
      </div>
    </div>
  </div>
</template>
