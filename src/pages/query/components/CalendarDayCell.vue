<script setup lang="ts">
defineProps<{
  cell: CalendarCell;
  year: number;
  month: number;
}>();

const emit = defineEmits<{
  (e: 'select', date: string): void;
}>();

const handleSelect = (cell: CalendarCell, year: number, month: number) => {
  if (cell.day > 0) {
    emit(
      'select',
      `${year}-${String(month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`
    );
  }
};
</script>

<template>
  <div
    role="button"
    :tabindex="cell.day > 0 ? 0 : undefined"
    class="relative flex min-h-13 cursor-pointer flex-col items-center justify-start rounded border border-transparent p-0.5 text-center hover:border-border"
    :class="[
      cell.isSelected ? 'bg-primary text-primary-foreground' : '',
      !cell.isSelected && cell.isToday ? 'border-primary bg-primary/5' : '',
      !cell.isSelected && cell.isHoliday ? 'bg-red-100/60 dark:bg-red-900/30' : '',
      !cell.isSelected && cell.isWeekend && !cell.isWorkday
        ? 'bg-red-50/60 dark:bg-red-950/20'
        : '',
      cell.holidayName && !cell.isHoliday && !cell.isWorkday && !cell.isSelected
        ? 'text-red-500 dark:text-red-400'
        : '',
      !cell.isSelected && !cell.isHoliday && cell.solarTerm
        ? 'text-green-600 dark:text-green-400'
        : '',
    ]"
    @click="handleSelect(cell, year, month)"
    @keydown.enter="handleSelect(cell, year, month)"
    @keydown.space.prevent="handleSelect(cell, year, month)"
  >
    <!-- Tag (班/休) -->
    <span
      v-if="cell.isWorkday"
      class="absolute top-0 left-0 flex size-3.5 items-center justify-center rounded-tl rounded-br bg-gray-200 text-[7px] leading-none font-bold text-gray-500 dark:bg-gray-700 dark:text-gray-300"
      :class="cell.isSelected ? 'bg-primary-foreground text-primary' : ''"
    >班</span>
    <span
      v-else-if="cell.isHoliday"
      class="absolute top-0 left-0 flex size-3.5 items-center justify-center rounded-tl rounded-br bg-red-100 text-[7px] leading-none font-bold text-red-700 dark:bg-red-900 dark:text-red-300"
      :class="cell.isSelected ? 'bg-primary-foreground text-primary' : ''"
    >休</span>
    <span
      v-else-if="cell.isWeekend"
      class="absolute top-0 left-0 flex size-3.5 items-center justify-center rounded-tl rounded-br bg-red-50 text-[7px] leading-none font-bold text-red-400 dark:bg-red-950 dark:text-red-400"
      :class="cell.isSelected ? 'bg-primary-foreground text-primary' : ''"
    >休</span>

    <!-- Day number -->
    <span
      class="mt-1 text-sm"
      :class="[
        !cell.isSelected && cell.isToday ? 'font-bold text-primary' : '',
        cell.isSelected ? 'font-bold text-primary-foreground' : '',
        !cell.isSelected && cell.holidayName && !cell.isHoliday && !cell.isWorkday
          ? 'font-bold text-red-500 dark:text-red-400'
          : '',
      ]"
    >{{ cell.day }}</span>

    <!-- Holiday/Solar term/Lunar -->
    <span
      v-if="cell.showHolidayName"
      class="text-[10px] leading-tight"
      :class="cell.isSelected ? 'text-primary-foreground' : 'text-red-500 dark:text-red-400'"
    >{{ cell.holidayName }}</span>
    <span
      v-else-if="cell.solarTerm"
      class="text-[10px] leading-tight"
      :class="cell.isSelected ? 'text-primary-foreground' : 'text-green-600 dark:text-green-400'"
    >{{ cell.solarTerm }}</span>
    <span
      v-else
      class="text-[10px] leading-tight"
      :class="cell.isSelected ? 'text-primary-foreground' : 'text-muted-foreground'"
    >{{ cell.lunar }}</span>
  </div>
</template>
