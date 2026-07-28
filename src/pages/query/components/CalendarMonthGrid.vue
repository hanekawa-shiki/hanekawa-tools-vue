<script setup lang="ts">
import { computed } from 'vue';
import {
  buildCalendarCells,
  getDayOfWeek,
  getDaysInMonth,
  getWeekdayNames,
} from './calendar-utils';
import CalendarDayCell from './CalendarDayCell.vue';

const props = defineProps<{
  year: number;
  month: number;
  selectedDate: string | null;
  weekStart: 0 | 6;
  holidaysLoaded: number;
}>();

const emit = defineEmits<{
  (e: 'select', date: string): void;
}>();

const daysInMonth = computed(() => getDaysInMonth(props.year, props.month));
const startDayOfWeek = computed(() => getDayOfWeek(props.year, props.month, 1));
const weekdayNames = computed(() => getWeekdayNames(props.weekStart));
const adjustedStart = computed(() =>
  props.weekStart === 6 ? (startDayOfWeek.value + 6) % 7 : startDayOfWeek.value
);
const cells = computed(() =>
  buildCalendarCells(props.year, props.month, daysInMonth.value, props.selectedDate)
);
const totalCells = computed(() => adjustedStart.value + daysInMonth.value);
</script>

<template>
  <div class="flex flex-col gap-1">
    <div class="grid grid-cols-7">
      <div
        v-for="(name, i) in weekdayNames"
        :key="name"
        class="text-center text-xs text-muted-foreground"
        :class="(i === 0 && weekStart === 6) || (i === 6 && weekStart === 0) ? 'text-red-400' : ''"
      >
        {{ name }}
      </div>
    </div>
    <div class="grid grid-cols-7 gap-px">
      <template v-for="idx in totalCells" :key="idx">
        <div v-if="idx <= adjustedStart" class="min-h-13" />
        <CalendarDayCell
          v-else
          :cell="cells[idx - adjustedStart - 1]"
          :year="year"
          :month="month"
          @select="(d) => emit('select', d)"
        />
      </template>
    </div>
  </div>
</template>
