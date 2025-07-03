
import type { EditorLanguage } from './types';

export interface EditorOptions {
   indentSize: number;
   indentStyle: 'tab' | 'space';
   charset: string;
   lineEndings: 'LF' | 'CRLF';
   wordWrap: boolean;
   language: EditorLanguage;
}
