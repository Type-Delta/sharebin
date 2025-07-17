<script setup lang="ts">
import { defineProps } from 'vue';

import CodeEditor from '@/views/CodeEditorView.vue';

const { viewArg } = defineProps<{
   viewArg: string;
}>();
</script>

<template>
   <CodeEditor />
</template>
