<script setup lang="ts">
import { useTheme } from '@/components/theme-provider.vue';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const { theme, setTheme } = useTheme();
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <button
        class="inline-flex size-8 items-center justify-center rounded-md text-sm font-medium hover:bg-muted hover:text-foreground"
      >
        <Icon v-if="theme === 'light'" name="Sun01Icon" class="size-6" :stroke-width="2" />
        <Icon v-else-if="theme === 'dark'" name="Moon02Icon" class="size-6" :stroke-width="2" />
        <Icon v-else name="RepeatIcon" class="size-6" :stroke-width="2" />
        <span class="sr-only">切换主题</span>
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @click="setTheme('light')">
        <Icon name="Sun01Icon" class="size-4" />
        浅色
      </DropdownMenuItem>
      <DropdownMenuItem @click="setTheme('dark')">
        <Icon name="Moon02Icon" class="size-4" />
        深色
      </DropdownMenuItem>
      <DropdownMenuItem @click="setTheme('system')">
        <Icon name="RepeatIcon" class="size-4" />
        跟随系统
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
