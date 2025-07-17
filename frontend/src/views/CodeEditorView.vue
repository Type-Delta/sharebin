<script setup lang="ts">
import {
   ref,
   shallowRef,
   defineModel,
   defineProps,
   onMounted,
   onBeforeUnmount
} from 'vue';
import { EditorView, basicSetup } from 'codemirror';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { EditorState } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { indentUnit } from '@codemirror/language';

import Tools from '@lib/Tools';
import { autoLanguage, getLanguage } from '@/modules/codemirrorLangAuto';
import { DEFAULT_EDITOR_OPTIONS } from '@/consts';
import type { VueComponentRef } from '@/types';
import router from '@/router/index';
import { Editor } from '@/modules/editor';
import type { EditorOptions } from '@/interfaces';

import { PhEraser, PhShareFat } from '@phosphor-icons/vue';
import { useToast } from 'primevue/usetoast';
import Menubar from 'primevue/menubar';
import Button from 'primevue/button';

import ErrorCodeView from '@/views/ErrorCodeView.vue';
import LogoButton from '@/components/LogoButton.vue';
import EditorShareModal from '@/components/EditorShareModal.vue';
import EditorStatus from '@/components/EditorStatus.vue';


const { deferredFunc } = Tools;


const props = defineProps<{
   viewArgs: {
      editorId: string;
   };
}>();

const toast = useToast();
let editorView: EditorView | null = null;
let editorHandle = new Editor(props.viewArgs.editorId);
const editorKeymap = keymap.of([
   ...defaultKeymap,
   indentWithTab,
]);
const defaultExtensions = [
   basicSetup,
   editorKeymap,
   EditorView.updateListener.of(deferredFunc(handleEditorUpdate, 130)),
];
let unloading = false;

const editorShareModal = ref<VueComponentRef<typeof EditorShareModal>>(null);
const editorContainer = ref<HTMLElement | null>(null);
const editorNotFound = ref(false);
const [editorOptions] = defineModel<EditorOptions>('options', {
   default: DEFAULT_EDITOR_OPTIONS
});
const editorStatus = ref({
   isOnline: false,
   isConnectionDrop: false,
   isConnecting: true,
   contentVersion: 0,
   serverCV: 0,
   stats: {
      ping: 0,
   },
});
const menubarItems = shallowRef([
   { label: 'Home', PhIcon: null, action: () => router.push('/') },
   {
      label: 'Clear',
      PhIcon: PhEraser,
      action: () => {
         if (!editorHandle) return;
         editorHandle.setContent('');
      },
      color: 'danger',
   },
]);


editorHandle.on('ping', (ping) => {
   updateEditorStatus();
});
editorHandle.on('highping', (ping) => {
   toast.add({
      severity: 'warn',
      summary: 'Bad Connection Detected',
      detail: `Server ping is high (${ping}ms). This may affect performance.`,
      life: 5000
   });
});
editorHandle.on('close', deferredFunc((status) => {
   if (unloading) return;

   if (status > 1000 && status < 2000) {
      updateEditorStatus();
      editorStatus.value.isConnectionDrop = true;

      toast.add({
         severity: 'error',
         summary: 'Connection Lost',
         detail: `Connection to the server has been lost. Please check your internet connection.\nStatus code: ${status}`,
         life: 5000
      });
   }
}, 1000));
editorHandle.on('reopen', () => {
   updateEditorStatus();
   editorStatus.value.isConnectionDrop = false;

   toast.add({
      severity: 'success',
      summary: 'Connection Restored',
      detail: `Connection to the server has been restored.`,
      life: 5000
   });
});
editorHandle.on('update', handleServerContentUpdate);


onMounted(async () => {
   window.addEventListener('beforeunload', () => {
      if (unloading) return;
      unloading = true;

      if (editorHandle) {
         editorHandle.close();
      }
   });

   editorView = new EditorView({
      doc: '',
      extensions: [],
      parent: editorContainer.value,
   });

   setEditorOptions(editorOptions.value);
   updateEditorStatus();

   editorStatus.value.isConnecting = true;
   const { error, status } = await editorHandle.connect();
   editorStatus.value.isConnecting = false;
   updateEditorStatus();

   if (error || status >= 4000) {
      switch (status) {
         case 4404:
            editorNotFound.value = true;
            document.title = 'Editor Not Found';
            break;
      }
      console.error(`Editor connection failed with status: ${status}`, error);
      return;
   }
});

onBeforeUnmount(() => {
   if (editorView) editorView.destroy();
});

function setEditorOptions(options: EditorOptions) {
   if (!editorView) return;

   const indentChar = options.indentStyle == 'space'
      ? ' '.repeat(options.indentSize)
      : '\t';
   const indentSetting = indentUnit.of(indentChar);
   editorContainer.value?.style.setProperty('--cm-tab-size', options.indentSize.toString());

   const language = options.language === 'auto'
      ? autoLanguage(editorView.state.doc.toString())
      : getLanguage(options.language);

   editorView.setState(
      EditorState.create({
         doc: editorView.state.doc,
         selection: editorView.state.selection,
         extensions: [
            ...defaultExtensions,
            indentSetting,
            options.wordWrap ? EditorView.lineWrapping : [],
            language
         ]
      })
   );
}

function handleEditorUpdate(update: any) {
   if (update.flags >> 5 || update.state.doc.toString() !== editorHandle.content) {
      const newContent = update.state.doc.toString();

      console.log('Document changed:', newContent);
      editorHandle.setContent(newContent);
   }
}

async function reconnectEditor() {
   if (!editorHandle || editorStatus.value.isConnecting) return;

   editorStatus.value.isConnecting = true;
   toast.add({
      severity: 'info',
      summary: 'Reconnecting...',
      detail: 'Attempting to reconnect to the editor server.',
      life: 5000
   });

   const { error, status } = await editorHandle.connect();
   editorStatus.value.isConnecting = false;

   if (error || status >= 4000) {
      console.error(`Editor reconnection failed with status: ${status}`, error);

      toast.add({
         severity: 'error',
         summary: 'Reconnection Failed',
         detail: `Failed to reconnect to the editor server. Please try again later.\nStatus code: ${status}`,
         life: 5000
      });
      return;
   }

   updateEditorStatus();
}

function handleServerContentUpdate(newContent: string) {
   // if(!editorView) return;
   console.log('Received content update from server:', newContent);
   setContent(newContent);
}

function setContent(content: string) {
   if (editorView) {
      editorView.dispatch({
         changes: { from: 0, to: editorView.state.doc.length, insert: content }
      });
      console.log('Content set in editor:', editorView.state.doc.toString());
   }
}

function getShareLink() {
   // TODO: Implement a proper share link generation logic with current editor state as query params
   return window.location.href;
}

function onShareBtnClick() {
   if (!editorShareModal.value) return;

   editorShareModal.value.show({
      title: 'Share Code',
      shareLink: getShareLink(),
   });
}

function updateEditorStatus() {
   if (!editorHandle) return;

   editorStatus.value.isOnline = editorHandle.isOnline;
   editorStatus.value.contentVersion = editorHandle.contentVersion;
   editorStatus.value.serverCV = editorHandle.serverCV;
   editorStatus.value.stats.ping = editorHandle.stats.ping;
}

defineExpose({
   setContent,
   getShareLink
});
</script>

<template>
   <ErrorCodeView v-if="editorNotFound" :error-code="404"
      message="We can't find the editor you're looking for, check your URL and try again." />
   <div v-else class="tw:contents">
      <header class="tw:sticky tw:top-8 tw:z-30">
         <!-- @ts-ignore -->
         <Menubar :model="menubarItems" class="main-menubar tw:backdrop-blur-sm">
            <template #start>
               <LogoButton />
               <hr class="vertical-divider" />
            </template>

            <template #item="{ item }">
               <Button :title="(item.label ?? '').toString()"
                  class="tw:flex tw:items-center tw:gap-2 tw:py-1.5 tw:px-1 tw:h-9 tw:w-full" @click="item.action"
                  :label="(item.label ?? '').toString()" :severity="item.color ?? 'secondary'" variant="outlined">
                  <component :is="item.PhIcon" class="menubar-item-icon" />
                  <p v-if="item.label">{{ item.label }}</p>
               </Button>
            </template>

            <template #end>
               <div class="tw:flex tw:items-center tw:gap-4">
                  <EditorStatus class="tw:ml-2" :status="editorStatus" @on-request-reconnect="reconnectEditor" />
                  <Button title="Share" class="tw:flex tw:items-center tw:gap-2 tw:py-1.5 tw:px-1 tw:h-9"
                     @click="onShareBtnClick" label="Share" severity="contrast" variant="outlined">
                     <PhShareFat class="menubar-item-icon" />
                     Share
                  </Button>
               </div>
            </template>
         </Menubar>
      </header>
      <div ref="editorContainer"></div>
   </div>

   <EditorShareModal ref="editorShareModal" />
</template>

<style>
@reference '@/assets/main.css';

.cm-editor {
   height: 100%;
}

.cm-selectionBackground,
.cm-editor ::selection {
   background-color: var(--p-blue-100) !important;

   @media (prefers-color-scheme: dark) {
      background-color: color-mix(in srgb, var(--p-teal-400), 50% transparent) !important;
   }
}


.cm-gutter {
   @apply tw:dark:bg-zinc-800;
}

.ͼ2 .cm-gutters {
   background-color: transparent;
   border-right: none;
}

.cm-gutter.cm-lineNumbers {
   border-radius: var(--p-menubar-border-radius) 0 0 var(--p-menubar-border-radius);
   border: 1px solid var(--p-menubar-border-color);
   border-right: none;
}

.cm-gutter.cm-foldGutter {
   border: 1px solid var(--p-menubar-border-color);
   border-left: none;
}

.cm-activeLineGutter {
   background-color: var(--p-zinc-200) !important;

   @media (prefers-color-scheme: dark) {
      background-color: var(--p-zinc-700) !important;
   }
}

.cm-content {
   @apply tw:caret-gray-300;

   border-radius: 0 var(--p-menubar-border-radius) var(--p-menubar-border-radius) 0;
   border: 1px solid var(--p-menubar-border-color);
}
</style>
