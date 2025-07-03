
import { resolveDiff, createHash } from '../utilities';
import { EditorsENT } from '../database/entity';
import {
   EditorWSBodyContentType,
   EditorWSUpdateReq,
   EditorWSSyncCheckReq
} from "../types";





export function wsEditor_updates(ws: any, body: EditorWSUpdateReq, editor: EditorsENT, editorId: string) {
   const resolvedContent = resolveDiff(editor.content, body.data);
   editor.content = resolvedContent;
   editor.contentVersion++;
   editor.lastModified = new Date();

   // Broadcast the update to all connections
   ws.publish(editorId, {
      value: resolvedContent,
      editorId,
      cv: editor.contentVersion,
      type: EditorWSBodyContentType.UPDATES,
      success: true,
   });
}


export function wsEditor_syncCheck(ws: any, body: EditorWSSyncCheckReq, editor: EditorsENT, editorId: string) {
   const currentHash = createHash(editor.content, 'sha1');

   const contentMatches = currentHash === body.data.hash;
   const cvMatches = editor.contentVersion === body.data.cv;

   ws.send({
      type: EditorWSBodyContentType.SYNC_CHECK,
      data: {
         contentMatches,
         cvMatches,
         hash: !contentMatches ? currentHash : undefined,
         value: !contentMatches ? editor.content : undefined,
         cv: !cvMatches ? editor.contentVersion : undefined,
      },
      success: true,
   });
}



