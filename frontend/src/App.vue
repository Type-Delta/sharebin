<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { ref, shallowRef, onMounted } from 'vue';

import CodeEditor from '@/components/CodeEditor.vue';
import router from '@/router/index';
import type { VueComponentRef } from '@/types';
import { redirectNewEditor } from './modules/teaparty';
import toast, { useToast } from '@/modules/toastService';

import { PhEraser, PhShareFat, PhFilePlus } from '@phosphor-icons/vue';
import Menubar from 'primevue/menubar';
import Button from 'primevue/button';
import Toast from 'primevue/toast';

import EditorShareModal from './components/EditorShareModal.vue';


const currentMenu = ref('home');
const routedComponentRef = ref();
const viewArgs = ref({});
const editorShareModal = ref<VueComponentRef<typeof EditorShareModal>>(null);
const menuItems = shallowRef({
   'home': [
      { label: 'New', icon: PhFilePlus, action: () => redirectNewEditor() },
   ],
   'editor': [
      { label: 'Home', icon: null, action: () => router.push('/') },
      {
         label: 'Clear',
         icon: PhEraser,
         action: () => {
            const editor = routedComponentRef.value as InstanceType<typeof CodeEditor>;
            editor.setContent('');
         },
         color: 'danger',
      },
   ],
});
const menuEndItems = shallowRef({
   'home': [],
   'editor': [
      {
         label: 'Share',
         icon: PhShareFat,
         action: () => {
            if (
               currentMenu.value !== 'editor' ||
               !editorShareModal.value || !routedComponentRef.value
            ) return;

            editorShareModal.value.show({
               title: 'Share Code',
               shareLink: routedComponentRef.value.getShareLink(),
            });
         },
         color: 'contrast'
      },
   ],
});

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
   <header class="tw:sticky tw:top-8 tw:z-30">
      <Menubar :model="menuItems[currentMenu]" class="tw:backdrop-blur-md">
         <template #start>
            <RouterLink to="/" class="logo tw:font-mono tw:text-2xl tw:font-bold tw:mx-2">
               Sharebin
            </RouterLink>
            <hr class="vertical-divider" />
         </template>

         <template #item="{ item }">
            <Button :title="(item.label ?? '').toString()"
               class="tw:flex tw:items-center tw:gap-2 tw:py-1.5 tw:px-1 tw:h-9 tw:w-full" @click="item.action"
               :label="(item.label ?? '').toString()" :severity="item.color ?? 'secondary'" variant="outlined">
               <component :is="item.icon" class="menubar-item-icon" />
               <p v-if="item.label">{{ item.label }}</p>
            </Button>
         </template>

         <template #end>
            <Button v-for="item in menuEndItems[currentMenu]" :key="item.label" :title="(item.label ?? '').toString()"
               class="tw:flex tw:items-center tw:gap-2 tw:py-1.5 tw:px-1 tw:h-9" @click="item.action"
               :label="(item.label ?? '').toString()" :severity="item.color ?? 'secondary'" variant="outlined">
               <component :is="item.icon" class="menubar-item-icon" />
               <p v-if="item.label">{{ item.label }}</p>
            </Button>
         </template>
      </Menubar>
   </header>

   <RouterView v-slot="{ Component }">
      <component :is="Component" :viewArgs="viewArgs" ref="routedComponentRef" />
   </RouterView>

   <footer>
      <p class="tw:text-center tw:text-xs tw:pb-4">
         <a href="https://github.com/Type-Delta/sharebin" target="_blank" rel="noopener noreferrer">Sharebin project</a>
         •
         <a href="https://github.com/Type-Delta/sharebin/blob/main/LICENSE" target="_blank"
            rel="noopener noreferrer">MIT
            License</a> © 2025 <a href="https://github.com/Type-Delta" target="_blank"
            rel="noopener noreferrer">Type-Delta</a>
      </p>
   </footer>

   <EditorShareModal ref="editorShareModal" />
   <Toast />
</template>

<style scoped>
.logo {
   color: var(--color-heading);
}

:deep(.p-menubar-root-list) {
   gap: 0;
}

:deep(.p-menubar-root-list > li button) {
   border-radius: 0;
}

:deep(.p-menubar-root-list > li:first-child button) {
   border-radius: var(--p-menubar-border-radius) 0 0 var(--p-menubar-border-radius);
}

:deep(.p-menubar-root-list > li:last-child button) {
   border-radius: 0 var(--p-menubar-border-radius) var(--p-menubar-border-radius) 0;
}

:deep(.p-menubar-root-list > li:first-child:last-child button) {
   border-radius: var(--p-menubar-border-radius);
}

footer a:hover {
   text-decoration: underline;
}
</style>
