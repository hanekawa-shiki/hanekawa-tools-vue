<script setup lang="ts">
import type { Component } from 'vue';
import {
  ArrowLeftRightIcon,
  BinocularsIcon,
  CalendarIcon,
  Cancel01Icon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ColorPickerIcon,
  Copy01Icon,
  Delete01Icon,
  Download01Icon,
  File01Icon,
  FileInputIcon,
  FileTypeIcon,
  FuelStationIcon,
  GithubIcon,
  HomeIcon,
  Layers01Icon,
  Link01Icon,
  MagnetIcon,
  Moon02Icon,
  RepeatIcon,
  Search01Icon,
  Sun01Icon,
  Upload01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/vue';
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    name: string;
    color?: string;
    strokeWidth?: number;
  }>(),
  {
    color: 'currentColor',
  }
);

const iconMap: Record<string, Component> = {
  HomeIcon,
  BinocularsIcon,
  CalendarIcon,
  FuelStationIcon,
  Layers01Icon,
  MagnetIcon,
  FileTypeIcon,
  ColorPickerIcon,
  ArrowLeftRightIcon,
  Sun01Icon,
  Moon02Icon,
  CheckIcon,
  Cancel01Icon,
  Search01Icon,
  RepeatIcon,
  GithubIcon,
  Upload01Icon,
  Delete01Icon,
  Download01Icon,
  Link01Icon,
  File01Icon,
  Copy01Icon,
  FileInputIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
};

const iconData = computed(() => iconMap[props.name]);
</script>

<template>
  <HugeiconsIcon
    v-if="iconData"
    :icon="iconData"
    :color="color"
    :stroke-width="strokeWidth"
    :class="$attrs.class"
    class="shrink-0"
  />
</template>
