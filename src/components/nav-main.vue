<script setup lang="ts">
import type { NavMainItem } from '@/composables/use-auto-routes';
import { ChevronRightIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/vue';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import Icon from '@/components/icon.vue';
import Collapsible from '@/components/ui/collapsible/Collapsible.vue';
import CollapsibleContent from '@/components/ui/collapsible/CollapsibleContent.vue';
import CollapsibleTrigger from '@/components/ui/collapsible/CollapsibleTrigger.vue';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

defineProps<{
  items: NavMainItem[];
}>();

const route = useRoute();
const { isMobile, setOpenMobile } = useSidebar();

const closedItems = ref<Set<string>>(new Set());

const toggleItem = (title: string) => {
  if (closedItems.value.has(title)) {
    closedItems.value.delete(title);
  } else {
    closedItems.value.add(title);
  }
};

const closeMobileSidebar = () => {
  if (isMobile.value) {
    setOpenMobile(false);
  }
};
</script>

<template>
  <div class="relative flex w-full min-w-0 flex-col p-2">
    <ul class="flex w-full min-w-0 flex-col gap-1">
      <li v-for="item in items" :key="item.title" class="group/menu-item relative">
        <template v-if="item.items && item.items.length > 0">
          <Collapsible :open="!closedItems.has(item.title)">
            <CollapsibleTrigger as-child>
              <div
                class="peer/menu-button group/menu-button flex w-full items-center gap-2 overflow-hidden rounded-lg px-3 py-2 text-left text-sm ring-sidebar-ring outline-hidden transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate"
                @click="toggleItem(item.title)"
              >
                <Icon v-if="item.icon" :name="item.icon" class="size-4 shrink-0" />
                <span class="flex-1 truncate">{{ item.title }}</span>
                <HugeiconsIcon
                  :icon="ChevronRightIcon"
                  :class="
                    cn(
                      'size-4 shrink-0 transition-transform duration-200',
                      !closedItems.has(item.title) && 'rotate-90'
                    )
                  "
                />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul
                class="mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5"
              >
                <li v-for="subItem in item.items" :key="subItem.title" class="relative">
                  <router-link
                    :to="subItem.url"
                    :class="
                      cn(
                        'flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sm text-sidebar-foreground ring-sidebar-ring outline-hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2',
                        route.path === subItem.url &&
                          'bg-sidebar-accent text-sidebar-accent-foreground'
                      )
                    "
                    @click="closeMobileSidebar"
                  >
                    <Icon v-if="subItem.icon" :name="subItem.icon" class="size-4 shrink-0" />
                    <span>{{ subItem.title }}</span>
                  </router-link>
                </li>
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </template>

        <template v-else>
          <router-link
            :to="item.url"
            :class="
              cn(
                'peer/menu-button group/menu-button flex w-full items-center gap-2 overflow-hidden rounded-lg px-3 py-2 text-left text-sm ring-sidebar-ring outline-hidden transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate',
                route.path === item.url && 'bg-sidebar-accent text-sidebar-accent-foreground'
              )
            "
            @click="closeMobileSidebar"
          >
            <Icon v-if="item.icon" :name="item.icon" class="size-4 shrink-0" />
            <span>{{ item.title }}</span>
          </router-link>
        </template>
      </li>
    </ul>
  </div>
</template>
