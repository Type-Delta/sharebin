<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

import fetchService from '@/modules/fetchService';

const parser = new DOMParser();

const props = defineProps<{
   src: string;
   monochrome?: boolean;
   reset?: boolean;
}>();
const svgContent = ref<string | null>(null);
const svgContainerElem = ref<HTMLElement | null>(null);

watch(() => props.src, () => {
   loadSvg(props.src).then(() => {
      injectSvg();
   });
});

onMounted(() => {
   if (props.src) {
      loadSvg(props.src).then(() => {
         injectSvg();
      });
   }
});


async function loadSvg(url: string) {
   const { data, error } = await fetchService.get(url);
   if (error) {
      console.error('Error fetching SVG:', error);
      return;
   }

   svgContent.value = data;
};

function injectSvg() {
   if (!(svgContainerElem.value && svgContent.value))
      return;

   const svgElement = parser.parseFromString(svgContent.value, 'image/svg+xml').documentElement;
   svgElement.setAttribute('class', 'svg-content');

   if (props.reset) {
      svgElement.removeAttribute('width');
      svgElement.removeAttribute('height');
   }

   if (props.monochrome) {
      svgElement.querySelectorAll('[fill], [stroke]').forEach((el) => {
         el.removeAttribute('fill');
         el.removeAttribute('stroke');
      });
      svgElement.querySelectorAll('[style*=fill]').forEach((el) => {
         (el as HTMLElement).style.fill = ''
      });
      svgElement.setAttribute('fill', 'currentColor');
      svgElement.setAttribute('stroke', 'currentColor');
   }

   svgContainerElem.value.innerHTML = '';
   svgContainerElem.value.appendChild(svgElement);
}
</script>


<template>
   <div class="dynamic-svg tw:content" ref="svgContainerElem">
   </div>
</template>
