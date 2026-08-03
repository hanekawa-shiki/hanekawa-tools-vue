<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

defineProps<{
  items: OilPriceCityData[];
}>();

function formatPrice(price: number): string {
  return price.toFixed(2);
}
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead class="h-12 text-left font-medium whitespace-nowrap"> 省/市 </TableHead>
        <TableHead class="h-12 text-right font-medium whitespace-nowrap"> 92#汽油 </TableHead>
        <TableHead class="h-12 text-right font-medium whitespace-nowrap"> 95#汽油 </TableHead>
        <TableHead class="h-12 text-right font-medium whitespace-nowrap"> 0#柴油 </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow
        v-for="item in items"
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
</template>
