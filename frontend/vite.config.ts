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
               'codemirror': ['@codemirror/state', '@codemirror/language', 'codemirror', '@codemirror/commands', '@codemirror/view'],
               'highlight': ['highlight.js/lib/core', 'highlight.js/lib/languages/javascript', 'highlight.js/lib/languages/python', 'highlight.js/lib/languages/json', 'highlight.js/lib/languages/css', 'highlight.js/lib/languages/xml', 'highlight.js/lib/languages/markdown', 'highlight.js/lib/languages/rust', 'highlight.js/lib/languages/shell', 'highlight.js/lib/languages/sql', 'highlight.js/lib/languages/bash', 'highlight.js/lib/languages/powershell', 'highlight.js/lib/languages/java', 'highlight.js/lib/languages/cpp', 'highlight.js/lib/languages/csharp', 'highlight.js/lib/languages/go', 'highlight.js/lib/languages/ruby', 'highlight.js/lib/languages/php', 'highlight.js/lib/languages/lua', 'highlight.js/lib/languages/perl', 'highlight.js/lib/languages/kotlin', 'highlight.js/lib/languages/swift', 'highlight.js/lib/languages/typescript', 'highlight.js/lib/languages/plaintext', 'highlight.js/lib/languages/yaml', 'highlight.js/lib/languages/properties', 'highlight.js/lib/languages/scss', 'highlight.js/lib/languages/xml'],
               'codemirror-json': ['@codemirror/lang-json'],
               'codemirror-python': ['@codemirror/lang-python'],
               'codemirror-php': ['@codemirror/lang-php'],
               'codemirror-html': ['@codemirror/lang-html'],
               'codemirror-css': ['@codemirror/lang-css'],
               'codemirror-yaml': ['@codemirror/lang-yaml'],
               'codemirror-markdown': ['@codemirror/lang-markdown'],
               'codemirror-rust': ['@codemirror/lang-rust'],
               'codemirror-shell': ['@codemirror/legacy-modes/mode/shell'],
               'codemirror-sql': ['@codemirror/lang-sql'],
               'codemirror-powershell': ['@codemirror/legacy-modes/mode/powershell'],
               'codemirror-clike': ['@codemirror/legacy-modes/mode/clike'],
               'codemirror-swift': ['@codemirror/legacy-modes/mode/swift'],
               'codemirror-lua': ['@codemirror/legacy-modes/mode/lua'],
               'codemirror-perl': ['@codemirror/legacy-modes/mode/perl'],
               'codemirror-properties': ['@codemirror/legacy-modes/mode/properties'],
               'codemirror-lcss': ['@codemirror/legacy-modes/mode/css'],
               'codemirror-xml': ['@codemirror/lang-xml'],
               'codemirror-java': ['@codemirror/lang-java'],
               'codemirror-cpp': ['@codemirror/lang-cpp'],
               'codemirror-csharp': ['@replit/codemirror-lang-csharp'],
               'codemirror-go': ['@codemirror/lang-go'],
               'codemirror-ruby': ['@codemirror/legacy-modes/mode/ruby'],
               'codemirror-javascript': ['@codemirror/lang-javascript'],
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
