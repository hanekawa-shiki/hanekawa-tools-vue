<script setup lang="ts">
import { useTheme } from '@/components/theme-provider.vue';
import { Button } from '@/components/ui/button';
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
      <Button variant="ghost" size="icon">
        <Icon v-if="theme === 'light'" name="Sun01Icon" class="size-6" :stroke-width="2" />
        <Icon v-else-if="theme === 'dark'" name="Moon02Icon" class="size-6" :stroke-width="2" />
        <Icon v-else name="RepeatIcon" class="size-6" :stroke-width="2" />
        <span class="sr-only">切换主题</span>
      </Button>
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
