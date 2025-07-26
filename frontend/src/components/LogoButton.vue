<script setup lang="ts">
import { RouterLink } from 'vue-router';

import DynamicSvg from '@/components/DynamicSvg.vue';
</script>


<template>
   <RouterLink to="/" class="logo">
      <DynamicSvg src="/assets/logo_full.svg" reset monochrome class="tw:aspect-auto tw:w-30" />
   </RouterLink>
</template>
