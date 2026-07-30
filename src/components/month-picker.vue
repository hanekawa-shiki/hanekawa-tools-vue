<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/vue';
import { computed, ref } from 'vue';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Month {
  number: number;
  name: string;
}

const props = withDefaults(
  defineProps<{
    selectedMonth?: Date;
    onMonthSelect?: (date: Date) => void;
    onYearForward?: () => void;
    onYearBackward?: () => void;
    callbacks?: {
      yearLabel?: (year: number) => string;
      monthLabel?: (month: Month) => string;
    };
    minDate?: Date;
    maxDate?: Date;
    disabledDates?: Date[];
    class?: string;
  }>(),
  {}
);

const MONTHS: Month[][] = [
  [
    { number: 0, name: '1月' },
    { number: 1, name: '2月' },
    { number: 2, name: '3月' },
    { number: 3, name: '4月' },
  ],
  [
    { number: 4, name: '5月' },
    { number: 5, name: '6月' },
    { number: 6, name: '7月' },
    { number: 7, name: '8月' },
  ],
  [
    { number: 8, name: '9月' },
    { number: 9, name: '10月' },
    { number: 10, name: '11月' },
    { number: 11, name: '12月' },
  ],
];

const selectedYear = computed(() => props.selectedMonth?.getFullYear() ?? new Date().getFullYear());
const selectedMonthIndex = computed(() => props.selectedMonth?.getMonth() ?? new Date().getMonth());

const menuYear = ref(selectedYear.value);

const effectiveMinDate = computed(() => {
  if (props.minDate && props.maxDate && props.minDate > props.maxDate) {
    return props.maxDate;
  }
  return props.minDate;
});

const disabledDatesMapped = computed(() =>
  props.disabledDates?.map((d) => ({ year: d.getFullYear(), month: d.getMonth() }))
);

function isDisabled(monthNumber: number): boolean {
  const y = menuYear.value;
  if (
    props.maxDate &&
    (y > props.maxDate.getFullYear() ||
      (y === props.maxDate.getFullYear() && monthNumber > props.maxDate.getMonth()))
  ) {
    return true;
  }
  if (
    effectiveMinDate.value &&
    (y < effectiveMinDate.value.getFullYear() ||
      (y === effectiveMinDate.value.getFullYear() &&
        monthNumber < effectiveMinDate.value.getMonth()))
  ) {
    return true;
  }
  if (disabledDatesMapped.value?.some((d) => d.year === y && d.month === monthNumber)) {
    return true;
  }
  return false;
}

function yearBackward() {
  menuYear.value--;
  props.onYearBackward?.();
}

function yearForward() {
  menuYear.value++;
  props.onYearForward?.();
}

function selectMonth(m: Month) {
  if (isDisabled(m.number)) {
    return;
  }
  props.onMonthSelect?.(new Date(menuYear.value, m.number));
}
</script>

<template>
  <div :class="cn('w-70 min-w-50 p-3', props.class)">
    <div class="relative flex items-center justify-center pt-1">
      <div class="text-sm font-medium">
        {{ callbacks?.yearLabel ? callbacks.yearLabel(menuYear) : menuYear }}
      </div>
      <div class="flex items-center space-x-1">
        <Button
          variant="outline"
          class="absolute left-1 inline-flex size-7 items-center justify-center p-0"
          @click="yearBackward"
        >
          <HugeiconsIcon :icon="ChevronLeftIcon" class="size-4 opacity-50" />
        </Button>
        <Button
          variant="outline"
          class="absolute right-1 inline-flex size-7 items-center justify-center p-0"
          @click="yearForward"
        >
          <HugeiconsIcon :icon="ChevronRightIcon" class="size-4 opacity-50" />
        </Button>
      </div>
    </div>
    <table class="w-full border-collapse space-y-1">
      <tbody>
        <tr v-for="monthRow in MONTHS" :key="monthRow[0].name" class="mt-2 flex w-full">
          <td
            v-for="m in monthRow"
            :key="m.number"
            class="relative h-10 w-1/4 p-0 text-center text-sm"
          >
            <Button
              :variant="
                selectedMonthIndex === m.number && menuYear === selectedYear ? 'default' : 'ghost'
              "
              :disabled="isDisabled(m.number)"
              class="size-full p-0 font-normal"
              @click="selectMonth(m)"
            >
              {{ callbacks?.monthLabel ? callbacks.monthLabel(m) : m.name }}
            </Button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
