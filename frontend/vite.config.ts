import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
   plugins: [
      vue(),
      vueDevTools(),
      tailwindcss(),
   ],
   resolve: {
      alias: {
         '@': fileURLToPath(new URL('./src', import.meta.url)),
         '@server': fileURLToPath(new URL('../backend/src', import.meta.url)),
         '@lib': fileURLToPath(new URL('../lib/default-esm/', import.meta.url)),
      },
   },
   build: {
      rollupOptions: {
         output: {
            manualChunks: {
               'codemirror00': ['@codemirror/lang-json', '@codemirror/lang-python'],
               'codemirror01': ['@codemirror/lang-php', '@codemirror/lang-html', '@codemirror/lang-css', '@codemirror/lang-yaml', '@codemirror/lang-markdown', '@codemirror/lang-rust', '@codemirror/legacy-modes/mode/shell', '@codemirror/lang-sql', '@codemirror/legacy-modes/mode/powershell'],
               'codemirror02': ['@codemirror/legacy-modes/mode/clike', '@codemirror/legacy-modes/mode/swift', '@codemirror/legacy-modes/mode/lua', '@codemirror/legacy-modes/mode/perl', '@codemirror/legacy-modes/mode/properties', '@codemirror/legacy-modes/mode/css', '@codemirror/lang-xml', '@replit/codemirror-lang-csharp', '@codemirror/lang-cpp', '@codemirror/lang-go'],
               'codemirror03': ['@codemirror/lang-java', '@codemirror/legacy-modes/mode/ruby', '@codemirror/lang-javascript'],
               'vue': ['vue', 'vue-router'],
               'phosphor': ['@phosphor-icons/vue'],
               'primevue': ['primevue/dialog', 'primevue/button', 'primevue/inputtext', 'primevue/menubar'],
               'preload': ['/src/assets/preload.css'],
               'tools': ['@lib/Tools'],
               'griseo': ['@lib/Griseo'],
            }
         }
      }
   }
})
