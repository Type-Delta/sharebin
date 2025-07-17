<script setup lang="ts">
import { ref, defineModel, defineProps, onMounted, onBeforeUnmount } from 'vue';
import { EditorView, basicSetup } from 'codemirror';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { EditorState } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { indentUnit } from '@codemirror/language';

import Tools from '@lib/Tools';
import { autoLanguage, getLanguage } from '@/modules/codemirrorLangAuto';
import { DEFAULT_EDITOR_OPTIONS } from '@/consts';
// import * as teaparty from '@/modules/teaparty';
import { Editor } from '@/modules/editor';
import type { EditorOptions } from '@/interfaces';

import { useToast } from 'primevue/usetoast';

import ErrorCodeView from '@/views/ErrorCodeView.vue';

const { deferredFunc } = Tools;


const editorContainer = ref<HTMLElement | null>(null);
const editorNotFound = ref(false);
const [editorOptions] = defineModel<EditorOptions>('options', {
   default: DEFAULT_EDITOR_OPTIONS
});
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


editorHandle.on('highping', (ping) => {
   toast.add({
      severity: 'warn',
      summary: 'Bad Connection Detected',
      detail: `Server ping is high (${ping}ms). This may affect performance.`,
      life: 5000
   });
});
editorHandle.on('close', (status) => {
   if (status > 1000 && status < 2000) {
      toast.add({
         severity: 'error',
         summary: 'Connection Lost',
         detail: `Connection to the server has been lost. Please check your internet connection.\nStatus code: ${status}`,
         life: 5000
      });
   }
});
editorHandle.on('reopen', () => {
   toast.add({
      severity: 'success',
      summary: 'Connection Restored',
      detail: `Connection to the server has been restored.`,
      life: 5000
   });
});
editorHandle.on('update', handleServerContentUpdate);


onMounted(async () => {
   editorView = new EditorView({
      doc: '',
      extensions: [],
      parent: editorContainer.value,
   });

   setEditorOptions(editorOptions.value);

   const { error, status } = await editorHandle.connect();
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

defineExpose({
   setContent,
   getShareLink
});
</script>

<template>
   <ErrorCodeView v-if="editorNotFound" :error-code="404"
      message="We can't find the editor you're looking for, check your URL and try again." />
   <div v-else ref="editorContainer"></div>
</template>

<style>
@reference '@/assets/main.css';

.cm-editor {
   height: 100%;
   font-family: var(--font-mono);
   font-size: 14px;
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
