<script setup lang="ts">
import {
  ArrowLeftRightIcon,
  BinocularsIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CircleIcon,
  ColorPickerIcon,
  FileTypeIcon,
  FuelStationIcon,
  GithubIcon,
  HomeIcon,
  Layers01Icon,
  MagnetIcon,
  Menu01Icon,
  Menu04Icon,
  Moon02Icon,
  RepeatIcon,
  Search01Icon,
  Settings02Icon,
  Sun01Icon,
  SunCloud02Icon,
  WrenchIcon,
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

const iconMap: Record<string, unknown> = {
  HomeIcon,
  BinocularsIcon,
  CalendarIcon,
  FuelStationIcon,
  Layers01Icon,
  MagnetIcon,
  FileTypeIcon,
  ColorPickerIcon,
  ArrowLeftRightIcon,
  WrenchIcon,
  Sun01Icon,
  Moon02Icon,
  Menu01Icon,
  Menu04Icon,
  Settings02Icon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CircleIcon,
  Search01Icon,
  SunCloud02Icon,
  RepeatIcon,
  GithubIcon,
};

const iconData = computed(() => iconMap[props.name] as any);
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
