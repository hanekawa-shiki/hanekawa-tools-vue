<script setup lang="ts">
import type { OilPriceCityData } from '@/api';
import { computed, ref } from 'vue';
import { fetchOilPriceApi } from '@/api';
import PageHeader from '@/components/page-header.vue';
import { Skeleton } from '@/components/ui/skeleton';
import OilPriceTable from './components/OilPriceTable.vue';

const SKELETON_COUNT = 8;

const prices = ref<OilPriceCityData[]>([]);
const loading = ref(true);
const updateDate = ref('');

const loadPrices = async () => {
  loading.value = true;
  try {
    const response = await fetchOilPriceApi();
    const sorted = [...response.data].sort((a, b) => {
      if (a.highlight && !b.highlight) {
        return -1;
      }
      if (!a.highlight && b.highlight) {
        return 1;
      }
      return a.first_letter.localeCompare(b.first_letter, 'zh-CN');
    });
    prices.value = sorted;
    updateDate.value = response.date;
  } finally {
    loading.value = false;
  }
};

loadPrices();

const midpoint = computed(() => Math.ceil(prices.value.length / 2));
const leftData = computed(() => prices.value.slice(0, midpoint.value));
const rightData = computed(() => prices.value.slice(midpoint.value));
</script>

<template>
  <div class="size-full">
    <PageHeader />
    <div class="mt-4">
      <p v-if="updateDate" class="mb-4 text-sm text-muted-foreground">
        数据更新日期：{{ updateDate }}
      </p>

      <template v-if="loading">
        <div class="space-y-3">
          <Skeleton v-for="i in SKELETON_COUNT" :key="i" class="h-12 w-full" />
        </div>
      </template>
      <template v-else>
        <div class="lg:hidden">
          <OilPriceTable :items="prices" />
        </div>
        <div class="hidden lg:grid lg:grid-cols-2 lg:gap-6">
          <OilPriceTable :items="leftData" />
          <OilPriceTable :items="rightData" />
        </div>
      </template>
    </div>
  </div>
</template>
