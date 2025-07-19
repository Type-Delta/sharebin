
import type { EditorOptions } from '@/interfaces';
import type { EditorLanguage } from '@/types';

export const DEFAULT_EDITOR_OPTIONS: EditorOptions = {
   indentSize: 3,
   indentStyle: 'space',
   charset: 'utf-8',
   lineEndings: 'LF',
   wordWrap: true,
   language: 'auto',
   fontSize: 14,
};

export const EDITOR_SUPPORTED_LANGUAGES: EditorLanguage[] = [
   'python',
   'javascript',
   'typescript',
   'json',
   'java',
   'csharp',
   'cpp',
   'go',
   'ruby',
   'php',
   'html',
   'css',
   'yaml',
   'markdown',
   'rust',
   'shell',
   'sql',
   'bash',
   'powershell',
   'kotlin',
   'swift',
   'lua',
   'perl',
   'properties',
   'scss',
   'xml',
   'plaintext',
   'auto',
];
