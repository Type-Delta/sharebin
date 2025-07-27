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


export async function autoLanguage(code: string): Promise<Extension> {
   const lang = hljs.highlightAuto(code).language;
   return getLanguage((lang || 'plaintext') as EditorLanguage);
}

export async function getLanguage(language: EditorLanguage): Promise<Extension> {
   switch (language) {
      case 'python':
         return (await import('@codemirror/lang-python')).python();
      case 'javascript':
         return (await import('@codemirror/lang-javascript')).javascript();
      case 'typescript':
         return (await import('@codemirror/lang-javascript')).javascript({ typescript: true });
      case 'json':
         return (await import('@codemirror/lang-json')).json();
      case 'java':
         return (await import('@codemirror/lang-java')).java();
      case 'csharp':
         return (await import('@replit/codemirror-lang-csharp')).csharp();
      case 'cpp':
         return (await import('@codemirror/lang-cpp')).cpp();
      case 'go':
         return (await import('@codemirror/lang-go')).go();
      case 'ruby':
         return StreamLanguage.define(
            (await import('@codemirror/legacy-modes/mode/ruby')).ruby
         );
      case 'php':
         return (await import('@codemirror/lang-php')).php();
      case 'html':
         return (await import('@codemirror/lang-html')).html();
      case 'css':
         return (await import('@codemirror/lang-css')).css();
      case 'yaml':
         return (await import('@codemirror/lang-yaml')).yaml();
      case 'markdown':
         return (await import('@codemirror/lang-markdown')).markdown();
      case 'rust':
         return (await import('@codemirror/lang-rust')).rust();
      case 'shell':
         return StreamLanguage.define(
            (await import('@codemirror/legacy-modes/mode/shell')).shell
         );
      case 'sql':
         return (await import('@codemirror/lang-sql')).sql();
      case 'bash':
         return StreamLanguage.define(
            (await import('@codemirror/legacy-modes/mode/shell')).shell
         );
      case 'powershell':
         return StreamLanguage.define(
            (await import('@codemirror/legacy-modes/mode/powershell')).powerShell
         );
      case 'kotlin':
         return StreamLanguage.define(
            (await import('@codemirror/legacy-modes/mode/clike')).kotlin
         );
      case 'swift':
         return StreamLanguage.define(
            (await import('@codemirror/legacy-modes/mode/swift')).swift
         );
      case 'lua':
         return StreamLanguage.define(
            (await import('@codemirror/legacy-modes/mode/lua')).lua
         );
      case 'perl':
         return StreamLanguage.define(
            (await import('@codemirror/legacy-modes/mode/perl')).perl
         );
      case 'properties':
         return StreamLanguage.define(
            (await import('@codemirror/legacy-modes/mode/properties')).properties
         );
      case 'scss':
         return StreamLanguage.define(
            (await import('@codemirror/legacy-modes/mode/css')).sCSS
         );
      case 'xml':
         return (await import('@codemirror/lang-xml')).xml();
      case 'plaintext':
         return [];
      default:
         return [];
   }
}
