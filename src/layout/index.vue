<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import avatarImg from '@/assets/avatar.jpeg';
import ModeToggle from '@/components/mode-toggle.vue';
import NavMain from '@/components/nav-main.vue';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { getRouteMenuItems } from '@/composables/use-auto-routes';
import pkg from '../../package.json';

const router = useRouter();
const routeMenuItems = computed(() => getRouteMenuItems());
</script>

<template>
  <SidebarProvider>
    <Sidebar variant="inset">
      <SidebarContent>
        <NavMain :items="routeMenuItems" />
      </SidebarContent>
      <SidebarFooter>
        <div class="flex flex-col items-center gap-3 px-2 py-4">
          <img
            :src="avatarImg"
            alt="avatar"
            class="aspect-square w-full rounded-full object-cover shadow-md"
          />
          <div class="flex flex-col items-center text-center leading-tight">
            <span class="text-sm font-semibold">Hanekawa Tools</span>
            <span
              class="mt-0.5 text-xs text-muted-foreground"
              title="我不是无所不知，只是刚好知道而已。"
            >
              何でもは知らないわよ。知ってることだけ
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
    <SidebarInset class="overflow-hidden">
      <header class="flex h-16 shrink-0 items-center gap-2">
        <div class="flex w-full items-center justify-between gap-2 px-4">
          <div class="flex h-full items-center gap-2">
            <SidebarTrigger class="size-6" />
            <Button variant="ghost" size="icon" class="size-8" @click="router.push('/home')">
              <Icon name="HomeIcon" :stroke-width="2" class="size-6" />
            </Button>
          </div>
          <div class="flex items-center gap-2">
            <a
              :href="pkg.homepage"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-block transition-colors hover:text-gray-500"
            >
              <Icon name="GithubIcon" :stroke-width="2" class="size-6" />
            </a>
            <ModeToggle />
          </div>
        </div>
      </header>
      <Separator />
      <div class="scroll-safari-style flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-4 pt-0">
        <RouterView />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
