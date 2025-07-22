<script setup lang="ts">
import { shallowRef } from 'vue';
import {
   PhCaretDoubleDown,
   PhShareFat,
   PhSparkle,
   PhMeteor,
   PhHardDrives,
   PhCaretUp,
   PhFilePlus,
} from '@phosphor-icons/vue';

import { redirectNewEditor } from '@/modules/teaparty';

import ScrollTop from 'primevue/scrolltop';
import Menubar from 'primevue/menubar';
import Button from 'primevue/button';

import FeatureGridItem from '@/components/FeatureGridItem.vue';
import EcosystemIcon from '@/components/icons/IconEcosystem.vue';
import SupportIcon from '@/components/icons/IconSupport.vue';
import LogoButton from '@/components/LogoButton.vue';

defineProps<{
   viewArgs: {};
}>();

const menubarItems = shallowRef([
   { label: 'New', PhIcon: PhFilePlus, action: () => redirectNewEditor() },
]);

</script>

<template>
   <header class="tw:sticky tw:top-8 tw:z-30">
      <Menubar :model="menubarItems" class="main-menubar">
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
      </Menubar>
   </header>

   <main class="tw:h-fit tw:flex tw:flex-col tw:gap-6">
      <div id="hero"
         class="hero-container tw:flex tw:flex-col tw:items-center tw:justify-center tw:container tw:md:mx-auto tw:h-[calc(90vh-5rem)]">
         <div
            class="hero tw:md:grid tw:md:grid-cols-2 tw:md:items-center tw:md:justify-center tw:w-full tw:flex tw:flex-col-reverse tw:items-start tw:gap-3">
            <div class="left heading tw:flex tw:flex-col tw:items-end">
               <div class="tw:md:max-w-[40vw] tw:md:ml-12">
                  <!-- TODO: make the background move w/ cursor pos -->
                  <h1
                     class="bg-primary-gradient-simple tw:text-4xl tw:font-bold tw:bg-clip-text tw:dark:text-gray-100/30 tw:text-gray-500/20 tw:text-balance">
                     Paste, share,<br>collaborate; No friction.
                  </h1>
                  <p class="tw:text-lg tw:mt-4">
                     Effortless sharing.<br>Lightning‑fast performance.<br>Zero hassle.
                  </p>
               </div>
            </div>
            <div class="right tw:col-start-2 tw:flex tw:items-center tw:h-full">
               <div class="logo tw:font-mono tw:text-6xl tw:font-bold tw:md:mx-auto">
                  Sharebin
               </div>
            </div>
         </div>
         <hr class="horizontal-divider tw:w-70! tw:mt-6! tw:mb-7!" />
         <div>
            <button @click="redirectNewEditor" class="cta-button bg-primary-gradient tw:rounded-md tw:text-gray-100">
               Start Sharing
               <PhShareFat weight="duotone" class="tw:inline tw:w-7 tw:-mr-2 tw:h-7 tw:ml-2 tw:translate-y-[0.3]" />
            </button>
            <a href="#features" class="tw:cursor-pointer tw:hover:opacity-80 tw:transition-opacity">See why you should
               try <span
                  class="bg-primary-gradient tw:bg-clip-text tw:dark:text-gray-100/30 tw:text-gray-500/20 tw:font-bold">Sharebin</span>
               <PhCaretDoubleDown weight="bold"
                  class="breathing-opacity tw:inline tw:w-5 tw:ml-1.5 tw:-translate-y-0.5" />
            </a>
         </div>
      </div>
      <div id="features"
         class="features-container tw:flex tw:flex-col tw:items-center tw:justify-center tw:container tw:md:mx-auto tw:h-[calc(90vh-5rem)]">
         <div class="tw:mx-auto tw:mt-10">
            <div class="section-heading tw:x-full tw:pl-4 tw:font-bold tw:-mt-12 tw:mb-8 tw:opacity-65 tw:text-2xl">
               Features</div>
            <div
               class="tw:mx-auto tw:grid tw:grid-cols-1 tw:gap-y-0 tw:gap-x-12 tw:md:grid-cols-2 tw:lg:gap-y-6 tw:lg:grid-cols-3 tw:md:max-w-4/5">
               <FeatureGridItem class="no-top-line">
                  <template #icon>
                     <PhSparkle class="tw:w-6 tw:h-6" />
                  </template>
                  <template #heading>Minimalist Interface</template>

                  Focus on what matters: your code. No ads, no clutter—just a clean editor powered by CodeMirror.
               </FeatureGridItem>

               <FeatureGridItem class="no-top-line">
                  <template #icon>
                     <PhMeteor weight="fill" class="tw:w-6 tw:h-6" />
                  </template>
                  <template #heading>Blazing‑Fast Performance</template>

                  TypeScript + Elysia.js + MongoDB + TypeORM under the hood means snappy load times, even on mobile.
               </FeatureGridItem>

               <FeatureGridItem class="no-top-line">
                  <template #icon>
                     <EcosystemIcon />
                  </template>
                  <template #heading>Cross‑Platform Ready</template>

                  Works smoothly in any modern browser—desktop or mobile—so you can paste & view on the go.
               </FeatureGridItem>

               <FeatureGridItem class="no-bottom-line">
                  <template #icon>
                     <PhHardDrives class="tw:w-6 tw:h-6" />
                  </template>
                  <template #heading>One‑Click Self‑Host</template>

                  For homelab tinkerers: spin up your own instance with a single Docker command. No config headaches.
               </FeatureGridItem>

               <FeatureGridItem class="no-bottom-line">
                  <template #icon>
                     <SupportIcon />
                  </template>
                  <template #heading>Privacy by Design</template>

                  Your pastes aren’t tracked or monetized. Just ephemeral links you can share at will. Your data is
                  yours,
                  always.
               </FeatureGridItem>
            </div>
         </div>
      </div>
   </main>
   <ScrollTop class="scroll-top">
      <template #icon>
         <PhCaretUp weight="bold" class="tw:w-4 tw:h-4" />
      </template>
   </ScrollTop>
</template>


<style scoped>
@reference '@/assets/main.css';

.logo {
   color: var(--color-heading);
}

.cta-button {
   display: flex;
   align-items: center;
   justify-content: center;
   width: 13rem;
   font-size: 1.1rem;
   font-weight: 600;
   cursor: pointer;
   margin: 0 auto 1rem auto;
   height: 55px;
   text-align: center;
   background-size: 300% 100%;
   -o-transition: all .4s ease-in-out;
   -webkit-transition: all .4s ease-in-out;
   transition: all .4s ease-in-out;
   box-shadow: 0 4px 15px 0 rgba(107, 52, 132, 0.597);
}

.cta-button:hover {
   background-position: 100% 0;
   -moz-transition: all .4s ease-in-out;
   -o-transition: all .4s ease-in-out;
   -webkit-transition: all .4s ease-in-out;
   transition: all .4s ease-in-out
}

.cta-button:focus {
   outline: none
}

.section-heading::before {
   content: '#';
   width: 4px;
   height: 100%;
   background-color: var(--color-primary);
}
</style>
