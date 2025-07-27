<script setup lang="ts">
import { RouterView } from 'vue-router';
import { ref, onMounted } from 'vue';

import router from '@/router/index';
import toast, { useToast } from '@/modules/toastService';

import Toast from 'primevue/toast';

import AnimatedBackground from '@/components/AnimatedBackground.vue';
import { removeMainLoader } from './utilities';

const APP_VERSION = import.meta.env.VITE_APP_VERSION || '';
let routeLoadingTimeout = null;

const currentMenu = ref('home');
const routedComponentRef = ref();
const viewArgs = ref({});
const routeLoading = ref(false);

onMounted(() => {
   // Initialize the toast instance
   toast.setInstance(useToast());
   removeMainLoader();
});

router.beforeEach((to, from) => {
   currentMenu.value = to.name.toString();

   if (currentMenu.value === 'editor') {
      viewArgs.value = {
         editorId: to.params.id as string,
      };
   }

   routeLoadingTimeout = setTimeout(() => {
      routeLoading.value = true;
   }, 100);

   return true;
});

router.afterEach(() => {
   if (routeLoadingTimeout) {
      clearTimeout(routeLoadingTimeout);
      routeLoadingTimeout = null;
   }
   routeLoading.value = false;
});
</script>

<template>
   <AnimatedBackground :freeze="currentMenu === 'editor'" />

   <div class="app-router-view tw:contents tw:relative">
      <RouterView v-slot="{ Component }">
         <component v-if="!routeLoading" :is="Component" :viewArgs="viewArgs" ref="routedComponentRef" />

         <Transition name="fade" mode="out-in">
            <div v-if="routeLoading" class="loader absolute" style="--stp-bg-color: transparent;">
               <div class="st-fallingLinesloader" style="--stp-line-thickness: 15%;"></div>
            </div>
         </Transition>
      </RouterView>
   </div>

   <footer :class="routeLoading ? 'tw:fixed tw:bottom-0 tw:left-0 tw:right-0 tw:z-20' : ''">
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

.app-router-view>* {
   animation: swipe-in 0.2s ease-out;
}

@keyframes swipe-in {
   from {
      transform: translateY(2%);
      opacity: 0;
   }

   to {
      transform: translateY(0);
      opacity: 1;
   }
}
</style>
