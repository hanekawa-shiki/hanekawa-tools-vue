<script setup lang="ts">
import { watch } from 'vue';
import { toast } from 'vue-sonner';
import { useSWUpdate } from '@/composables/use-sw-update';

const { needRefresh, applyUpdate } = useSWUpdate();

watch(needRefresh, (val) => {
  if (val) {
    toast.info('有新版本可用', {
      description: '点击下方按钮获取最新版本',
      action: {
        label: '立即更新',
        onClick: () => applyUpdate(),
      },
      duration: Number.POSITIVE_INFINITY,
    });
  }
});
</script>

<template>
  <div></div>
</template>
