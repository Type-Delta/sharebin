import './assets/main.css';

import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import ToastService from 'primevue/toastservice';

import App from '@/App.vue';
import router from '@/router';

const pvPreset = definePreset(Aura, {
   semantic: {
      primary: {
         50: '{indigo.50}',
         100: '{indigo.100}',
         200: '{indigo.200}',
         300: '{indigo.300}',
         400: '{indigo.400}',
         500: '{indigo.500}',
         600: '{indigo.600}',
         700: '{indigo.700}',
         800: '{indigo.800}',
         900: '{indigo.900}',
         950: '{indigo.950}'
      }
   }
});

const app = createApp(App);
app.use(PrimeVue, {
   ripple: true,
   inputStyle: 'filled',
   theme: {
      preset: pvPreset
   },
});
app.use(router);
app.use(ToastService);

app.mount('#app');
