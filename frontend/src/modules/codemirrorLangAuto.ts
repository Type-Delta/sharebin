import hljs from 'highlight.js/lib/core';
import type { Extension } from '@codemirror/state';
import { StreamLanguage } from '@codemirror/language';

import type { EditorLanguage } from '@/types';

import pythonHL from 'highlight.js/lib/languages/python';
import javascriptHL from 'highlight.js/lib/languages/javascript';
import jsonHL from 'highlight.js/lib/languages/json';
import typescriptHL from 'highlight.js/lib/languages/typescript';
import javaHL from 'highlight.js/lib/languages/java';
import csharpHL from 'highlight.js/lib/languages/csharp';
import cppHL from 'highlight.js/lib/languages/cpp';
import goHL from 'highlight.js/lib/languages/go';
import rubyHL from 'highlight.js/lib/languages/ruby';
import phpHL from 'highlight.js/lib/languages/php';
import htmlHL from 'highlight.js/lib/languages/xml';
import cssHL from 'highlight.js/lib/languages/css';
import yamlHL from 'highlight.js/lib/languages/yaml';
import markdownHL from 'highlight.js/lib/languages/markdown';
import rustHL from 'highlight.js/lib/languages/rust';
import shellHL from 'highlight.js/lib/languages/shell';
import sqlHL from 'highlight.js/lib/languages/sql';
import bashHL from 'highlight.js/lib/languages/bash';
import powershellHL from 'highlight.js/lib/languages/powershell';
import kotlinHL from 'highlight.js/lib/languages/kotlin';
import swiftHL from 'highlight.js/lib/languages/swift';
import luaHL from 'highlight.js/lib/languages/lua';
import perlHL from 'highlight.js/lib/languages/perl';
import propertiesHL from 'highlight.js/lib/languages/properties';
import scssHL from 'highlight.js/lib/languages/scss';
import xmlHL from 'highlight.js/lib/languages/xml';
import plaintextHL from 'highlight.js/lib/languages/plaintext';

import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { java } from '@codemirror/lang-java';
import { csharp } from '@replit/codemirror-lang-csharp';
import { cpp } from '@codemirror/lang-cpp';
import { go } from '@codemirror/lang-go';
import { ruby } from '@codemirror/legacy-modes/mode/ruby';
import { php } from '@codemirror/lang-php';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { yaml } from '@codemirror/lang-yaml';
import { markdown } from '@codemirror/lang-markdown';
import { rust } from '@codemirror/lang-rust';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import { sql } from '@codemirror/lang-sql';
import { powerShell } from '@codemirror/legacy-modes/mode/powershell';
import { kotlin } from '@codemirror/legacy-modes/mode/clike';
import { swift } from '@codemirror/legacy-modes/mode/swift';
import { lua } from '@codemirror/legacy-modes/mode/lua';
import { perl } from '@codemirror/legacy-modes/mode/perl';
import { properties } from '@codemirror/legacy-modes/mode/properties';
import { sCSS } from '@codemirror/legacy-modes/mode/css';
import { xml } from '@codemirror/lang-xml';



// Register languages with highlight.js
// @ts-ignore
hljs.registerLanguage('python', pythonHL);
hljs.registerLanguage('javascript', javascriptHL);
hljs.registerLanguage('typescript', typescriptHL);
hljs.registerLanguage('json', jsonHL);
hljs.registerLanguage('java', javaHL);
hljs.registerLanguage('csharp', csharpHL);
hljs.registerLanguage('cpp', cppHL);
hljs.registerLanguage('go', goHL);
hljs.registerLanguage('ruby', rubyHL);
hljs.registerLanguage('php', phpHL);
hljs.registerLanguage('html', htmlHL);
hljs.registerLanguage('css', cssHL);
hljs.registerLanguage('yaml', yamlHL);
hljs.registerLanguage('markdown', markdownHL);
hljs.registerLanguage('rust', rustHL);
hljs.registerLanguage('shell', shellHL); // @ts-ignore
hljs.registerLanguage('sql', sqlHL); // @ts-ignore
hljs.registerLanguage('bash', bashHL); // @ts-ignore
hljs.registerLanguage('powershell', powershellHL);
hljs.registerLanguage('kotlin', kotlinHL);
hljs.registerLanguage('swift', swiftHL);
hljs.registerLanguage('lua', luaHL); // @ts-ignore
hljs.registerLanguage('perl', perlHL); // @ts-ignore
hljs.registerLanguage('properties', propertiesHL);
hljs.registerLanguage('scss', scssHL);
hljs.registerLanguage('xml', xmlHL); // @ts-ignore
hljs.registerLanguage('plaintext', plaintextHL);


export function autoLanguage(code: string): Extension {
   const lang = hljs.highlightAuto(code).language;
   return getLanguage((lang || 'plaintext') as EditorLanguage);
}

export function getLanguage(language: EditorLanguage): Extension {
   switch (language) {
      case 'python':
         return python();
      case 'javascript':
         return javascript();
      case 'typescript':
         return javascript({ typescript: true });
      case 'json':
         return json();
      case 'java':
         return java();
      case 'csharp':
         return csharp();
      case 'cpp':
         return cpp();
      case 'go':
         return go();
      case 'ruby':
         return StreamLanguage.define(ruby);
      case 'php':
         return php();
      case 'html':
         return html();
      case 'css':
         return css();
      case 'yaml':
         return yaml();
      case 'markdown':
         return markdown();
      case 'rust':
         return rust();
      case 'shell':
         return StreamLanguage.define(shell);
      case 'sql':
         return sql();
      case 'bash':
         return StreamLanguage.define(shell);
      case 'powershell':
         return StreamLanguage.define(powerShell);
      case 'kotlin':
         return StreamLanguage.define(kotlin);
      case 'swift':
         return StreamLanguage.define(swift);
      case 'lua':
         return StreamLanguage.define(lua);
      case 'perl':
         return StreamLanguage.define(perl);
      case 'properties':
         return StreamLanguage.define(properties);
      case 'scss':
         return StreamLanguage.define(sCSS);
      case 'xml':
         return xml();
      case 'plaintext':
         return [];
      default:
         return [];
   }
}
