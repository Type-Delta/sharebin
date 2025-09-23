<script setup lang="ts">
import {
   ref,
   shallowRef,
   onMounted,
   onBeforeUnmount,
   reactive,
} from 'vue';
import { EditorView, basicSetup } from 'codemirror';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { StateEffect } from '@codemirror/state';
import { keymap, ViewUpdate } from '@codemirror/view';
import { indentUnit } from '@codemirror/language';

import Tools from '@lib/Tools';
import Griseo from '@lib/Griseo';
import { autoLanguage, getLanguage } from '@/modules/codemirrorLangAuto';
import { DEFAULT_EDITOR_OPTIONS, EDITOR_SUPPORTED_LANGUAGES, PLATFORM } from '@/consts';
import { type EditorLanguage, type VueComponentRef } from '@/types';
import router from '@/router/index';
import { Editor, type EditorState } from '@/modules/editor';
import type { EditorStatus, EditorOptions } from '@/interfaces';

import { PhEraser, PhShareFat } from '@phosphor-icons/vue';
import { useToast } from 'primevue/usetoast';
import Menubar from 'primevue/menubar';
import Button from 'primevue/button';
import Select, { type SelectChangeEvent } from 'primevue/select';

import ErrorCodeView from '@/views/ErrorCodeView.vue';
import LogoButton from '@/components/LogoButton.vue';
import EditorShareModal from '@/components/EditorShareModal.vue';
import EditorStatusbar from '@/components/EditorStatusbar.vue';


const { deferredFunc } = Tools;

const props = defineProps<{
   viewArgs: {
      editorId: string;
   };
}>();

const toast = useToast();
let editorView: EditorView | null = null;
const editorHandle = new Editor(props.viewArgs.editorId);
const editorKeymap = keymap.of([
   ...defaultKeymap,
   indentWithTab,
]);
const defaultExtensions = [
   basicSetup,
   editorKeymap,
   EditorView.updateListener.of(deferredFunc(handleEditorUpdate, 160)),
];
let unloading = false;
let highPingWarned = false;
let quietReconnect = false;
const onMacLike = PLATFORM === 'macos';
const editorFontSizeRange = ref({
   min: 8,
   max: 32,
   step: 2,
});

const editorShareModal = ref<VueComponentRef<typeof EditorShareModal>>(null);
const editorContainer = ref<HTMLElement | null>(null);
const editorNotFound = ref(false);
const [editorOptions] = defineModel<EditorOptions>('options', {
   default: DEFAULT_EDITOR_OPTIONS
});
const editorStatus = ref<EditorStatus>({
   isOnline: false,
   isConnectionDrop: false,
   isConnecting: true,
   isLoadingResources: false,
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
         setContent('');
      },
      color: 'danger',
   },
   reactive({
      label: editorOptions.value.language,
      type: 'select',
      selectItems: EDITOR_SUPPORTED_LANGUAGES,
      action: (ev: SelectChangeEvent) => {
         const nextLang = ev.value as EditorLanguage;

         setLanguage(nextLang);
         editorHandle.setLanguage(nextLang);
      },
   })
]);


editorHandle.on('ping', () => {
   updateEditorStatus();
});
editorHandle.on('highping', (ping) => {
   if (highPingWarned) return;
   highPingWarned = true;

   toast.add({
      severity: 'warn',
      summary: 'Bad Connection Detected',
      group: 'editor-connection',
      detail: `Server ping is high (${ping}ms). This may affect performance.`,
      life: 5000
   });
});
editorHandle.on<number>('close', deferredFunc((status) => {
   if (unloading) return;

   if (status > 1000 && status < 2000) {
      updateEditorStatus();
      editorStatus.value.isConnectionDrop = true;

      toast.add({
         severity: 'error',
         summary: 'Connection Lost',
         group: 'editor-connection',
         detail: `Connection to the server has been lost. Please check your internet connection.\nStatus code: ${status}`,
         life: 5000
      });
   }
}, 1000));
editorHandle.on<{ isReopen: boolean }>('open', ({ isReopen }) => {
   if (!isReopen) return;

   updateEditorStatus();
   editorStatus.value.isConnectionDrop = false;

   toast.removeGroup('editor-connection');
   if (!quietReconnect) {
      toast.add({
         severity: 'success',
         summary: 'Connection Restored',
         detail: `Connection to the server has been restored.`,
         life: 5000
      });
   }
});
editorHandle.on<EditorState>('update', handleServerContentUpdate);


onMounted(async () => {
   Griseo.onVisibilityChange(state => {
      if (state.visibilityState === 'visible' && !editorStatus.value.isOnline) {
         console.log('Editor is offline, attempting to reconnect...');
         reconnectEditor(true);
      }
   }, true);
   setupKeyboardShortcuts();

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

onBeforeUnmount(handleEditorUnload);

async function setEditorOptions(options?: Partial<EditorOptions>) {
   if (!editorView) return;

   options = {
      ...editorOptions.value,
      ...options || {},
   };

   const indentChar = options.indentStyle == 'space'
      ? ' '.repeat(options.indentSize)
      : '\t';
   const indentExt = indentUnit.of(indentChar);
   editorContainer.value?.style.setProperty('--cm-tab-size', options.indentSize.toString());

   const fontSizeExt = EditorView.theme({
      '&': {
         fontSize: `${options.fontSize}px`,
      },
   });

   editorStatus.value.isLoadingResources = true;
   const languageExt = await (options.language === 'auto'
      ? autoLanguage(editorView.state.doc.toString())
      : getLanguage(options.language));
   editorStatus.value.isLoadingResources = false;

   editorOptions.value = options as EditorOptions;

   editorView.dispatch({
      effects: StateEffect.reconfigure.of([
         ...defaultExtensions,
         indentExt,
         options.wordWrap ? EditorView.lineWrapping : [],
         languageExt,
         fontSizeExt,
      ])
   });
}

function handleEditorUpdate(update: ViewUpdate) {
   if (update.docChanged || update.state.doc.toString() !== editorHandle.content) {
      const newContent = update.state.doc.toString();

      editorHandle.setContent(newContent);
      updateLanguageDetection();
   }
}

async function reconnectEditor(quiet = false) {
   if (!editorHandle || editorStatus.value.isConnecting) return;
   quietReconnect = quiet;

   editorStatus.value.isConnecting = true;
   if (!quiet) {
      toast.add({
         severity: 'info',
         summary: 'Reconnecting...',
         group: 'editor-connection',
         detail: 'Attempting to reconnect to the editor server.',
         life: 5000
      });
   }

   const { error, status } = await editorHandle.connect();
   editorStatus.value.isConnecting = false;

   if (error || status >= 4000) {
      console.error(`Editor reconnection failed with status: ${status}`, error);

      toast.add({
         severity: 'error',
         summary: 'Reconnection Failed',
         group: 'editor-connection',
         detail: `Failed to reconnect to the editor server. Please try again later.\nStatus code: ${status}`,
         life: 5000
      });
      return;
   }

   updateEditorStatus();
}

function handleServerContentUpdate({ content: newContent, lang }: EditorState) {
   console.log('Received content update from server:', newContent, lang);
   setContent(newContent);
   if (lang) setLanguage((lang ?? 'auto') as EditorLanguage);
   else updateLanguageDetection();
}

function setContent(content: string) {
   if (editorView) {
      editorView.dispatch({
         changes: { from: 0, to: editorView.state.doc.length, insert: content }
      });
      console.log('Content set in editor:', editorView.state.doc.toString());
   }
}

function setLanguage(language: EditorLanguage) {
   if (editorOptions.value.language === language) return;
   console.log('Setting language to:', language);

   setEditorOptions({ language });
   menubarItems.value[2].label = language;
   // triggerRef(menubarItems);
   console.log('Language updated in menubar:', menubarItems.value[2].label);
}

function getShareLink() {
   const editorId = router.currentRoute.value.params.id as string;
   return `${window.location.origin}/e/${editorId}`;
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

function updateLanguageDetection() {
   if (!editorView || editorOptions.value.language !== 'auto') return;

   setEditorOptions();
}

function setupKeyboardShortcuts() {
   window.addEventListener('wheel', ev => {
      if (onMacLike ? ev.metaKey : ev.ctrlKey) {
         ev.preventDefault();

         const delta = ev.deltaY > 0 ? -1 : 1;
         const newSize = Math.max(
            editorFontSizeRange.value.min,
            Math.min(
               editorFontSizeRange.value.max,
               editorOptions.value.fontSize + delta * editorFontSizeRange.value.step
            )
         );
         setEditorOptions({ fontSize: newSize });
      }
   }, { passive: false });
}

function handleEditorUnload() {
   if (unloading) return;

   unloading = true;
   if (editorView) editorView.destroy();
   if (editorHandle) {
      editorHandle.close();
   }
}

defineExpose({
   setContent,
   getShareLink
});
</script>

<template>
   <div class="tw:contents">
      <ErrorCodeView v-if="editorNotFound" :error-code="404"
         message="We can't find the editor you're looking for, check your URL and try again." />
      <div v-else class="tw:contents">
         <header class="tw:sticky tw:top-8 tw:z-30">
            <Menubar :model="menubarItems" class="main-menubar">
               <template #start>
                  <LogoButton />
                  <hr class="vertical-divider" />
               </template>

               <template #item="{ item }">
                  <Select v-if="item.type === 'select'" :options="item.selectItems" @change="item.action"
                     v-model:model-value="item.label"
                     class="tw:w-32 tw:h-9 tw:py-1.5 tw:flex tw:items-center tw:gap-2 p-button-outlined tw:max-w-min"
                     :show-clear="false" dropdown-icon="none">
                  </Select>
                  <Button v-else :title="(item.label ?? '').toString()"
                     class="tw:flex tw:items-center tw:gap-2 tw:py-1.5 tw:px-1 tw:h-9 tw:w-full" @click="item.action"
                     :label="(item.label ?? '').toString()" :severity="item.color ?? 'secondary'" variant="outlined">
                     <component :is="item.PhIcon" class="menubar-item-icon" />
                     <p v-if="item.label">{{ item.label }}</p>
                  </Button>
               </template>

               <template #end>
                  <div class="tw:flex tw:items-center tw:gap-4">
                     <EditorStatusbar class="tw:ml-2" :status="editorStatus" @on-request-reconnect="reconnectEditor" />
                     <Button title="Share" class="tw:flex tw:items-center tw:gap-2 tw:py-1.5 tw:px-1 tw:h-9"
                        @click="onShareBtnClick" label="Share" variant="outlined" severity="secondary">
                        <PhShareFat class="menubar-item-icon" />
                        Share
                     </Button>
                  </div>
               </template>
            </Menubar>
         </header>
         <div ref="editorContainer" class="editor">
         </div>
      </div>

      <EditorShareModal ref="editorShareModal" />
   </div>
</template>

<style>
@reference '@/assets/main.css';

.cm-editor {
   height: 100%;
   background: var(--p-menubar-background);
   border-radius: var(--p-menubar-border-radius);
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

.p-select {
   background: var(--p-menubar-background) !important;

   & .p-select-label {
      color: var(--p-button-outlined-secondary-color) !important;
   }
}

.p-select-dropdown {
   display: none !important;
}
</style>
