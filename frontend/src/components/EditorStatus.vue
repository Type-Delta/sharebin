<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';
import type { EditorStatus } from '@/interfaces';

import { PhWifiX, PhNetworkSlash, PhCircleNotch } from '@phosphor-icons/vue';

defineProps<{
   status: EditorStatus
}>();
defineEmits<{
   onRequestReconnect: () => void;
}>();

function getColorClassFromPing(ping: number): string {
   if (ping > 999) return 'tw:text-red-500';
   if (ping > 299) return 'tw:dark:text-yellow-500 tw:text-yellow-600';
   return 'tw:dark:text-lime-300 tw:text-lime-600';
}
</script>


<template>
   <div class="tw:grid">
      <div class="ping-module tw:text-sm tw:font-mono tw:font-semibold tw:select-none">
         <div v-if="status.isOnline && (status.stats.ping > 999 || status.isConnectionDrop)"
            v-tooltip.left="'Connection lost.\nClick to reconnect'" class="tw:cursor-pointer"
            @click="$emit('onRequestReconnect')">
            <PhWifiX :size="24" class="icon tw:text-danger tw:w-5" weight="bold" />
         </div>
         <div v-else-if="status.isOnline && status.stats.ping <= 999"
            v-tooltip.left="'Online.\nNetwork Latency: ' + status.stats.ping + 'ms'" class="tw:cursor-default">
            <div v-if="status.stats.ping > -1" class="icon" :class="getColorClassFromPing(status.stats.ping)">
               {{ status.stats.ping }}ms
            </div>
            <div v-else class="icon tw:text-lime-300">
               --
            </div>
         </div>
         <div v-else-if="status.isConnecting" v-tooltip.left="'Connecting...'" class="tw:cursor-default">
            <PhCircleNotch :size="24" class="icon tw:text-gray-400 tw:w-5 tw:animate-spin" weight="bold" />
         </div>
         <div v-else v-tooltip.left="'Not connected. Click to reconnect'" class="tw:cursor-pointer"
            @click="$emit('onRequestReconnect')">
            <PhNetworkSlash :size="24" class="icon tw:text-danger tw:w-5" weight="bold" />
         </div>
      </div>
   </div>
</template>
