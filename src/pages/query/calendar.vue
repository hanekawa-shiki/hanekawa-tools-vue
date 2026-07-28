<script setup lang="ts">
import dayjs from 'dayjs';
import { ref, watch } from 'vue';
import PageHeader from '@/components/page-header.vue';
import { fetchHolidays } from '@/data/holidays';
import { getWeekStart, setWeekStart } from './components/calendar-utils';
import CalendarDateDetail from './components/CalendarDateDetail.vue';
import CalendarLegend from './components/CalendarLegend.vue';
import CalendarMonthGrid from './components/CalendarMonthGrid.vue';
import CalendarNav from './components/CalendarNav.vue';

const now = dayjs();
const year = ref(now.year());
const month = ref(now.month());
const selectedDate = ref<string | null>(now.format('YYYY-MM-DD'));
const weekStartState = ref<0 | 6>(getWeekStart());
const holidaysLoaded = ref(0);

watch(
  year,
  (y) => {
    void fetchHolidays(y).then(() => {
      holidaysLoaded.value++;
    });
  },
  { immediate: true }
);

const adjustSelectedDate = (newYear: number, newMonth: number) => {
  if (selectedDate.value === null) {
    return;
  }
  const parsed = dayjs(selectedDate.value);
  const targetDay = parsed.date();
  const lastDay = new Date(newYear, newMonth + 1, 0).getDate();
  const day = Math.min(targetDay, lastDay);
  selectedDate.value = `${newYear}-${String(newMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const handleMonthSelect = (date: Date) => {
  const newYear = date.getFullYear();
  const newMonth = date.getMonth();
  year.value = newYear;
  month.value = newMonth;
  adjustSelectedDate(newYear, newMonth);
};

const handleWeekStartChange = (val: string) => {
  const v = Number(val) as 0 | 6;
  weekStartState.value = v;
  setWeekStart(v);
};

const handleGoToday = () => {
  year.value = now.year();
  month.value = now.month();
  selectedDate.value = now.format('YYYY-MM-DD');
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <PageHeader />
    <CalendarNav
      :year="year"
      :month="month"
      :week-start="weekStartState"
      @month-select="handleMonthSelect"
      @week-start-change="handleWeekStartChange"
      @go-today="handleGoToday"
    />
    <CalendarLegend />
    <div class="flex flex-col gap-4 lg:flex-row">
      <div class="flex-1 rounded-lg border bg-card p-4">
        <CalendarMonthGrid
          :year="year"
          :month="month"
          :selected-date="selectedDate"
          :week-start="weekStartState"
          :holidays-loaded="holidaysLoaded"
          @select="(d) => (selectedDate = d)"
        />
      </div>
      <div class="rounded-lg border bg-card lg:w-72 lg:shrink-0">
        <CalendarDateDetail :selected-date="selectedDate" :holidays-loaded="holidaysLoaded" />
      </div>
    </div>
  </div>
</template>
