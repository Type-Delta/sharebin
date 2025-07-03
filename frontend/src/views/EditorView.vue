<script setup lang="ts">
import { defineProps } from 'vue';

import CodeEditor from '@/components/CodeEditor.vue';

const { viewArg } = defineProps<{
   viewArg: string;
}>();
</script>

<template>
   <CodeEditor />
</template>
