<script setup lang="ts">
import { computed } from 'vue';
import Icon from '@/components/icon.vue';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { pageMeta } from '@/router/config';

interface ToolItem {
  title: string;
  description: string;
  icon?: string;
  url: string;
}

const tools = computed<ToolItem[]>(() => {
  if (!pageMeta) {
    return [];
  }

  return Object.entries(pageMeta)
    .filter(([path, meta]) => path !== '/' && !meta.hidden)
    .map(([path, meta]) => ({
      title: meta.title ?? path,
      description: meta.description ?? '',
      icon: meta.icon ?? undefined,
      url: path,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
});
</script>

<template>
  <div class="flex flex-1 flex-col gap-6 pt-4">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">
        工具列表
      </h1>
      <p class="text-sm text-muted-foreground">
        请选择要使用的工具
      </p>
    </div>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <router-link v-for="tool in tools" :key="tool.url" :to="tool.url" class="block">
        <Card class="transition-colors hover:bg-accent/50">
          <CardHeader class="gap-3">
            <CardTitle class="flex items-center gap-2 text-xl">
              <div v-if="tool.icon" class="size-8 text-muted-foreground">
                <Icon :name="tool.icon" class="size-full" />
              </div>
              {{ tool.title }}
            </CardTitle>
            <CardDescription v-if="tool.description" class="line-clamp-2 h-10 break-all">
              {{ tool.description }}
            </CardDescription>
          </CardHeader>
        </Card>
      </router-link>
    </div>
  </div>
</template>
