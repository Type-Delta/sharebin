<script setup lang="ts">
import { ref, defineExpose } from 'vue';

import { copyToClipboard } from '@/utilities';

import { PhCopy } from '@phosphor-icons/vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

import type { VueComponentRef } from '@/types';

import QRCode from '@/components/QRCode.vue';
import qrStylingOptions from '@/assets/qrcode-style.js';
import { getPreferredColorScheme } from '@/utilities';

import type { QRCodeOptions } from '@/components/QRCode.vue';

const visible = ref(false);
const header = ref('Share Code');
const qrStyleOption = ref<QRCodeOptions>(qrStylingOptions);
const qrCodeElement = ref<VueComponentRef<typeof QRCode>>(null);

defineExpose({
   show: ({ title, shareLink }: { title?: string; shareLink: string }) => {
      header.value = title || header.value;
      visible.value = true;
      qrStyleOption.value.data = shareLink;

      if (getPreferredColorScheme() === 'dark') {
         qrStyleOption.value.dotsOptions.color = '#d1d1d1';
         qrStyleOption.value.backgroundOptions.color = '#18181b';
         qrStyleOption.value.cornersSquareOptions.color = '#d1d1d1';
         qrStyleOption.value.cornersDotOptions.color = '#d1d1d1';
      } else {
         qrStyleOption.value.dotsOptions.color = '#2f2f2f';
         qrStyleOption.value.backgroundOptions.color = '#ffffff';
         qrStyleOption.value.cornersSquareOptions.color = '#2f2f2f';
         qrStyleOption.value.cornersDotOptions.color = '#2f2f2f';
      }
   },
   hide: () => {
      visible.value = false;
   },
});

function selectAllFromInput(event: MouseEvent) {
   const input = event.target as HTMLInputElement;
   input.select();
}
</script>

<template>
   <Dialog v-model:visible="visible" modal :header="header" :style="{ width: 'min(25rem, 90vw)' }">
      <div class="tw:w-full tw:flex tw:justify-center">
         <QRCode ref="qrCodeElement" :options="qrStyleOption" class="tw:aspect-square tw:w-32" />
      </div>
      <p class="tw:text-center tw:mt-2 tw:text-sm tw:text-gray-600 tw:dark:text-gray-400">
         Scan the QR code to share your code!<br />
         Or copy the link below to share it with others.
      </p>
      <div class="tw:mt-8 tw:px-4 tw:gap-2 tw:flex tw:h-11 tw:items-center">
         <InputText v-model="qrStyleOption.data" class="tw:w-full tw:h-full" readonly @click="selectAllFromInput" />
         <Button @click="copyToClipboard(qrStyleOption.data)" class="tw:aspect-square tw:h-full tw:px-2! tw:py-1!">
            <PhCopy class="tw:w-full" />
         </Button>
      </div>
      <p class="tw:mt-2 tw:text-sm tw:text-gray-600 tw:dark:text-gray-400 tw:italic tw:text-pretty">
         Note: Anyone with this link can view and edit your code.<br />
         Make sure to share it only with people you trust.
      </p>
   </Dialog>
</template>
