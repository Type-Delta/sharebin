
import type { EditorLanguage } from './types';

export interface EditorOptions {
   indentSize: number;
   indentStyle: 'tab' | 'space';
   charset: string;
   lineEndings: 'LF' | 'CRLF';
   wordWrap: boolean;
   language: EditorLanguage;
}

export interface EditorStatus {
   isOnline: boolean;
   isConnectionDrop: boolean;
   isConnecting: boolean;
   contentVersion: number;
   serverCV: number;
   stats: {
      ping: number;
   };
}
