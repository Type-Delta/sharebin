import { diffChars } from 'diff';

import {
   type EContentDiffObject,
   type EditorWSBodyRequest,
   EditorWSBodyContentType,
   type EditorWSBodyResponse
} from '@server/types';
import Tools from '@lib/Tools';
import { createHash } from '@/utilities';
import * as teaparty from '@/modules/teaparty';

const { IDGenerator } = Tools;

const syncIntervalMS = 1000 * 30;
const pingIntervalMS = 1000 * 5;

interface EditorStats {
   ping: number;
}

export interface CallbackIdentifier {
   type: EditorEventType;
   id: string;
}

export type EditorEventType = 'update' | 'close' | 'open' | 'highping' | 'ping';

export class Editor extends EventTarget {
   id: string;
   connection: any;
   contentVersion: number = -1;
   serverCV: number = -1;
   diffs: EContentDiffObject[] = [];
   stats: EditorStats = {
      ping: -1
   };
   isOnline: boolean = false;
   protected _content: string = '';
   private callbacks: Map<string, { oneTime: boolean, callback: (data?: any) => void, event: EditorEventType }> = new Map();
   private syncInterval: number | null = null;
   private pingInterval: number | null = null;
   private firstOpen: boolean = true;
   private pingPendingTS: number | null = null;

   get content(): string {
      return this._content;
   }

   constructor(id: string) {
      super();
      this.id = id;
   }

   connect(): Promise<{ error: any, status: number }> {
      if (this.isOnline && this.connection) {
         this.close();
         this.cleanup();
      }

      return new Promise(async (resolve, reject) => {
         const { connection, error, status } = await teaparty.connectEditor(this.id);

         if (error || status >= 4000) {
            console.error(`Error connecting to editor ${this.id}:`, error);
            resolve({ error, status });
            return;
         }

         this.once('open', () => {
            console.log(`Editor ${this.id} connected successfully.`);

            this.isOnline = true;
            this.syncInterval = setInterval(() => {
               requestAnimationFrame(() => {
                  this.syncCheck();
               });
            }, syncIntervalMS);
            this.pingInterval = setInterval(() => {
               requestAnimationFrame(() => {
                  this.ping();
               });
            }, pingIntervalMS);

            resolve({ error: null, status: 200 });
         });
         this.once('close', (code: number) => {
            resolve({ error: null, status: code });
         });

         this.connection = connection;
         this.init();
      });
   }

   async setContent(newContent: string): Promise<void> {
      if (!this.connection || this.connection.ws?.readyState !== WebSocket.OPEN)
         return;

      if (this._content === newContent)
         return;
      console.log({ old: this._content, new: newContent });

      let headIndex = 0;
      const diff = diffChars(this._content, newContent, { ignoreCase: false })
         .map(part => {
            let index = headIndex;
            if (!part.removed) {
               headIndex += part.value.length;
            }

            return {
               length: part.count,
               value: part.value,
               added: part.added,
               removed: part.removed,
               index,
            };
         })
         .filter(part => part.added || part.removed);

      this._content = newContent;
      this.contentVersion += 1;

      const contentDiffs: EContentDiffObject[] = diff.map(part => ({
         value: part.removed ? undefined : part.value,
         index: part.index,
         rmLength: part.removed ? part.value.length : undefined
      }));


      this.diffs = contentDiffs;

      if (contentDiffs.length === 0) return;
      this.connection.send({
         type: EditorWSBodyContentType.UPDATES,
         data: contentDiffs,
      } as EditorWSBodyRequest);
   }


   async syncCheck(): Promise<void> {
      if (!this.connection || this.connection.ws?.readyState !== WebSocket.OPEN) return;
      if (!this._content) return;

      this.connection.send({
         type: EditorWSBodyContentType.SYNC_CHECK,
         data: {
            cv: this.contentVersion,
            hash: await createHash(this._content, 'sha1')
         }
      } as EditorWSBodyRequest);
   }

   ping(): void {
      if (!this.connection || this.connection.ws?.readyState !== WebSocket.OPEN) return;
      if (this.pingPendingTS && Date.now() - this.pingPendingTS < pingIntervalMS) return;

      this.pingPendingTS = Date.now();
      this.connection.send({
         type: EditorWSBodyContentType.PING,
         data: {
            ts: Date.now()
         }
      } as EditorWSBodyRequest);
   }

   close(): void {
      if (!this.connection || this.connection.ws?.readyState !== WebSocket.CLOSED) return;

      this.connection.close();
   }

   on(event: EditorEventType, callback: (data?: any) => void): CallbackIdentifier {
      this.addEventListener(event, (ev: CustomEvent) => {
         if (ev.detail) {
            callback(ev.detail);
         } else {
            callback();
         }
      });

      const id = IDGenerator([...this.callbacks.keys()], 'cb-BBBBB')
      this.callbacks.set(id, { oneTime: false, callback, event });

      return {
         type: event,
         id: id
      }
   }

   once(event: EditorEventType, callback: (data?: any) => void): CallbackIdentifier {
      const identifier = this.on(event, (data?: any) => {
         callback(data);
         this.off(event, callback);
      });

      this.callbacks.set(identifier.id, { oneTime: true, callback, event });
      return identifier;
   }

   off(event: EditorEventType, callback: (data?: any) => void): void {
      const identifier = [...this.callbacks.entries()].find(([_, cb]) => cb.callback === callback);
      if (identifier) {
         this.callbacks.delete(identifier[0]);
         this.removeEventListener(event, callback);
      }
   }

   removeAllListeners(event?: EditorEventType): void {
      this.callbacks.forEach((cb, id) => {
         if (!event || cb.event === event)
            this.off(event, cb.callback);
      });

      this.callbacks.clear();
   }



   private init() {
      this.connection.on('message', ev => {
         const res: EditorWSBodyResponse = ev.data as EditorWSBodyResponse;

         // console.log(`Message received from editor ${this.id}:`, res);
         if (!res.success) {
            return;
         }

         switch (res.type) {
            case EditorWSBodyContentType.OPEN:
               console.log(`Connection opened for editor ${this.id}`);
               this.ping();
               this.emit('open', { value: res.data.value, isReopen: !this.firstOpen });
               this.firstOpen = false;
            // FALLTHROUGH
            case EditorWSBodyContentType.UPDATES:
               this._content = res.data.value || '';
               this.serverCV = this.contentVersion = res.data.cv;
               this.emit('update', this._content);
               break;

            case EditorWSBodyContentType.SYNC_CHECK:
               this._content = res.data.value || this._content;

               if (!res.data.contentMatches) {
                  console.warn(`Content mismatch for editor ${this.id}. Expected hash: ${res.data.hash}, Current hash: ${createHash(this._content, 'sha1')}`);
                  this.emit('update', this._content);
               }
               if (!res.data.cvMatches) {
                  console.warn(`CV mismatch for editor ${this.id}. Expected CV: ${res.data.cv}, Current CV: ${this.contentVersion}`);
                  this.emit('update', this._content);
               }
               break;

            case EditorWSBodyContentType.PONG:
               if (!this.pingPendingTS) {
                  console.warn(`Received PONG without pending ping for editor ${this.id}`);
                  return;
               }
               const ping = (Date.now() - this.pingPendingTS) >> 1;
               this.stats.ping = ping;

               this.emit('ping', ping);
               if (ping > 500) {
                  this.emit('highping', ping);
               }
               break;
         }

      });

      this.connection.on('close', ({ code }) => {
         console.log(`WebSocket connection closed with code ${code}`);

         this.isOnline = false;
         this.emit('close', code);
         this.cleanup();
      });
   }

   private emit(event: EditorEventType, data?: any): void {
      this.dispatchEvent(new CustomEvent(event, { detail: data }));
   }

   private cleanup(): void {
      if (this.syncInterval) {
         clearInterval(this.syncInterval);
         this.syncInterval = null;
      }

      if (this.pingInterval) {
         clearInterval(this.pingInterval);
         this.pingInterval = null;
      }

      this.connection?.close();
      this.connection = null;
   }
}
