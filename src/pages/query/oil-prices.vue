<script setup lang="ts">
import { computed, ref } from 'vue';
import { fetchOilPriceApi } from '@/api';
import PageHeader from '@/components/page-header.vue';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const SKELETON_COUNT = 8;

const prices = ref<OilPriceCityData[]>([]);
const loading = ref(true);
const updateDate = ref('');

function formatPrice(price: number): string {
  return price.toFixed(2);
}

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="h-12 text-left font-medium whitespace-nowrap"> 省/市 </TableHead>
                <TableHead class="h-12 text-right font-medium whitespace-nowrap">
                  92#汽油
                </TableHead>
                <TableHead class="h-12 text-right font-medium whitespace-nowrap">
                  95#汽油
                </TableHead>
                <TableHead class="h-12 text-right font-medium whitespace-nowrap">
                  0#柴油
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="item in prices"
                :key="item.dim_id"
                :class="item.highlight ? 'bg-primary/10' : ''"
              >
                <TableCell class="font-medium">
                  {{ item.city_name }}
                </TableCell>
                <TableCell class="text-right">
                  {{ formatPrice(item.v92) }}
                </TableCell>
                <TableCell class="text-right">
                  {{ formatPrice(item.v95) }}
                </TableCell>
                <TableCell class="text-right">
                  {{ formatPrice(item.v0) }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div class="hidden lg:grid lg:grid-cols-2 lg:gap-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="h-12 text-left font-medium whitespace-nowrap"> 省/市 </TableHead>
                <TableHead class="h-12 text-right font-medium whitespace-nowrap">
                  92#汽油
                </TableHead>
                <TableHead class="h-12 text-right font-medium whitespace-nowrap">
                  95#汽油
                </TableHead>
                <TableHead class="h-12 text-right font-medium whitespace-nowrap">
                  0#柴油
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="item in leftData"
                :key="item.dim_id"
                :class="item.highlight ? 'bg-primary/10' : ''"
              >
                <TableCell class="font-medium">
                  {{ item.city_name }}
                </TableCell>
                <TableCell class="text-right">
                  {{ formatPrice(item.v92) }}
                </TableCell>
                <TableCell class="text-right">
                  {{ formatPrice(item.v95) }}
                </TableCell>
                <TableCell class="text-right">
                  {{ formatPrice(item.v0) }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="h-12 text-left font-medium whitespace-nowrap"> 省/市 </TableHead>
                <TableHead class="h-12 text-right font-medium whitespace-nowrap">
                  92#汽油
                </TableHead>
                <TableHead class="h-12 text-right font-medium whitespace-nowrap">
                  95#汽油
                </TableHead>
                <TableHead class="h-12 text-right font-medium whitespace-nowrap">
                  0#柴油
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="item in rightData"
                :key="item.dim_id"
                :class="item.highlight ? 'bg-primary/10' : ''"
              >
                <TableCell class="font-medium">
                  {{ item.city_name }}
                </TableCell>
                <TableCell class="text-right">
                  {{ formatPrice(item.v92) }}
                </TableCell>
                <TableCell class="text-right">
                  {{ formatPrice(item.v95) }}
                </TableCell>
                <TableCell class="text-right">
                  {{ formatPrice(item.v0) }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </template>
    </div>
  </div>
</template>
