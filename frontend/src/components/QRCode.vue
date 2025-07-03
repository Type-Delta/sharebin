<script setup lang="ts">
import { ref, onMounted, watch, defineProps, defineExpose } from 'vue';
import QRCodeStyling from 'qr-code-styling';

import type { Options as QRCodeOptions, FileExtension } from 'qr-code-styling';

const { options } = defineProps<{
   options: Partial<QRCodeOptions>;
}>();
const qrCodeController = ref<InstanceType<typeof QRCodeStyling> | null>(null);
const qrCodeElement = ref<HTMLElement | null>(null);

onMounted(() => {
   qrCodeController.value = new QRCodeStyling(options);
   qrCodeController.value.append(qrCodeElement.value!);
});

watch(() => options.data, () => {
   if (qrCodeController.value) {
      qrCodeController.value.update(options);
   }
});

defineExpose({
   download: (extension: FileExtension = 'svg') => {
      if (qrCodeController.value) {
         qrCodeController.value.download({ extension });
      }
   }
});

export type { QRCodeOptions, FileExtension };
</script>


<template>
   <div ref="qrCodeElement" class="qr-code tw:rounded-2xl"> </div>
</template>


<style>
.qr-code {
   background: transparent;
}

.qr-code>canvas {
   width: 100% !important;
   height: 100% !important;
   aspect-ratio: 1 !important;
}
</style>
