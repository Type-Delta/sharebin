
import { resolveDiff, createHash } from '../utilities';
import { EditorsENT } from '../database/entity';
import db from "../database";

import {
   EditorWSBodyContentType,
   EditorWSUpdateReq,
   EditorWSSyncCheckReq,
   EditorWSBodyResponse,
   EditorWSBodySyncCheckRes,
   EditorWSLanguageChangeReq
} from "../types";





export function wsEditor_updates(ws: any, body: EditorWSUpdateReq, editor: EditorsENT, editorId: string) {
   const resolvedContent = resolveDiff(editor.content, body.data);
   editor.content = resolvedContent;
   editor.contentVersion++;
   editor.lastModified = new Date();

   const data: EditorWSBodyResponse = {
      type: EditorWSBodyContentType.UPDATES,
      data: {
         value: resolvedContent,
         editorId,
         cv: editor.contentVersion,
         lang: editor.language ?? undefined,
      },
      success: true,
   };

   // Broadcast the update to all connections
   ws.publish(editorId, data, true);
}


export function wsEditor_syncCheck(ws: any, body: EditorWSSyncCheckReq, editor: EditorsENT) {
   const currentHash = createHash(editor.content, 'sha1');

   const contentMatches = currentHash === body.data.hash;
   const cvMatches = editor.contentVersion === body.data.cv;

   const data: EditorWSBodySyncCheckRes = {
      type: EditorWSBodyContentType.SYNC_CHECK,
      data: {
         contentMatches,
         cvMatches,
         hash: !contentMatches ? currentHash : undefined,
         value: !contentMatches ? editor.content : undefined,
         cv: !cvMatches ? editor.contentVersion : undefined,
      },
      success: true,
   };

   ws.send(data, true);
}


export async function wsEditor_setLanguage(ws: any, body: EditorWSLanguageChangeReq, editor: EditorsENT, editorId: string) {
   if (!body.data.lang) {
      ws.send({
         success: false,
         error: `INVALID_REQUEST`,
         message: `Language not specified`,
      });
      return;
   }

   if (editor.language === body.data.lang) {
      ws.send({
         success: true,
         message: `Language already set to ${body.data.lang}`,
      });
      return;
   }

   try {
      await db.controller.setEditorLanguage(editorId, body.data.lang);
   }
   catch (error) {
      ws.send({
         success: false,
         error: `INTERNAL_SERVER_ERROR`,
         message: `Failed to set language for editor ${editorId}: ${(error as Error).message}`,
      });
      return;
   }

   ws.publish(editorId, {
      type: EditorWSBodyContentType.UPDATES,
      success: true,
      data: {
         editorId,
         cv: editor.contentVersion,
         lang: body.data.lang,
      },
   });
}


