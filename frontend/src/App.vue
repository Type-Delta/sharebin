<script setup lang="ts">
import { RouterView } from 'vue-router';
import { ref, onMounted } from 'vue';

import router from '@/router/index';
import toast, { useToast } from '@/modules/toastService';

import Toast from 'primevue/toast';

import AnimatedBackground from '@/components/AnimatedBackground.vue';

const APP_VERSION = import.meta.env.VITE_APP_VERSION || '';

const currentMenu = ref('home');
const routedComponentRef = ref();
const viewArgs = ref({});

onMounted(() => {
   // Initialize the toast instance
   toast.setInstance(useToast());
});

router.beforeEach((to, from) => {
   currentMenu.value = to.name.toString();

   if (currentMenu.value === 'editor') {
      viewArgs.value = {
         editorId: to.params.id as string,
      };
   }

   return true;
});
</script>

<template>
   <AnimatedBackground />

   <RouterView v-slot="{ Component }">
      <component :is="Component" :viewArgs="viewArgs" ref="routedComponentRef" />
   </RouterView>

   <footer>
      <p class="tw:text-center tw:text-xs tw:pb-4">
         <a href="https://github.com/Type-Delta/sharebin" target="_blank" rel="noopener noreferrer">Sharebin</a>
         &nbsp;<span class="tw:ml-[-0.2rem] tw:opacity-60 tw:font-bold">{{ APP_VERSION }}</span>
         &nbsp;•&nbsp;
         <a href="https://github.com/Type-Delta/sharebin/blob/main/LICENSE" target="_blank"
            rel="noopener noreferrer">MIT
            License</a> © 2025 <a href="https://github.com/Type-Delta" target="_blank"
            rel="noopener noreferrer">Type-Delta</a>
      </p>
   </footer>
   <Toast position="bottom-right" />
</template>

<style scoped>
footer a:hover {
   text-decoration: underline;
}
</style>
