import { Elysia, t } from "elysia";

import Tools from '../../../lib/esm/Tools';
import { sendConsoleOutput } from '../utilities';
import { t_EditorWSBodyRequest } from "../dto/reqest.dto";
import { t_BaseResponse, t_EditorWSBodyResponse } from "../dto/response.dto";
import { EditorWSBodyContentType } from "../types";
import { wsEditor_syncCheck, wsEditor_updates } from "../handlers/websocket";
import db from "../database";
import { setRedirect } from "./router";

const { IDGenerator } = Tools;


const activeSessions: Set<string> = new Set();


const apiRoutes = new Elysia()
   .group("api/v1", (app) => app
      .get("/e/:editorId/session", async ({ params, set, cookie }) => {
         const editorId = params.editorId;

         if (!await db.controller.hasEditor(editorId)) {
            set.status = 404;
            return {
               success: false,
               error: `NOT_FOUND`,
               message: `Editor ${editorId} not found`,
            };
         }

         const sid = IDGenerator(activeSessions, 'BBBBBBBB');

         if (!sid) {
            set.status = 409;
            return {
               success: false,
               error: `CONFLICT`,
               message: `Session ID generation failed`,
            };
         }

         return {
            success: true,
            value: sid,
         };
      }, {
         params: t.Object({
            editorId: t.String(),
         }),
         response: t.Object({
            ...t_BaseResponse.properties,
            value: t.Optional(t.String()),
         })
      })
      .get("/e/new", async ({ set, query, request }) => {
         let editorId;
         let conflictList: string[] = [];

         do {
            editorId = IDGenerator(conflictList, 'BBBBBBBBB');
            if (editorId === null)
               break;

            if (await db.controller.hasEditor(editorId)) {
               conflictList.push(editorId);
               editorId = null; // Reset if conflict
            }

         } while (!editorId);

         if (!editorId) {
            set.status = 409;
            return {
               success: false,
               error: `CONFLICT`,
               message: `Editor ID generation failed`,
            };
         }

         try {
            await db.controller.createEditor(editorId);
         }
         catch (error) {
            set.status = 500;
            return {
               success: false,
               error: `INTERNAL_SERVER_ERROR`,
               message: `Failed to create new editor: ${(error as Error).message}`,
            };
         }

         if (query.redirect) {
            setRedirect(`/editor/${editorId}`, set, request);
         }
         else {
            set.status = 201;
            set.headers['Location'] = `/editor/${editorId}`;
         }

         return {
            success: true,
            value: editorId,
         };
      }, {
         query: t.Object({
            redirect: t.Boolean({ default: false, description: 'Redirect to editor page after creation' }),
         }),
      })
      .ws("/e/:editorId", {
         params: t.Object({
            editorId: t.String(),
         }),
         query: t.Object({
            sid: t.String({
               description: 'Session ID for identification',
               example: 'session12345'
            })
         }),
         body: t_EditorWSBodyRequest,
         response: t_EditorWSBodyResponse,
         async open(ws) {
            const editorId = ws.data.params.editorId;
            sendConsoleOutput(`WebSocket connection established for editor ${editorId} for session ${ws.data.query.sid}`, 'normal', 'Elysia');

            if (!activeSessions.has(ws.data.query.sid)) {
               sendConsoleOutput(`Session ID ${ws.data.query.sid} not found`, 'error', 'Elysia');
               ws.close(4404, `Session ID ${ws.data.query.sid} not found`);
               return;
            }

            const editor = await db.controller.getEditorById(editorId);
            if (!editor) {
               sendConsoleOutput(`Editor ${editorId} not found`, 'error', 'Elysia');
               ws.close(4404, `Editor ${editorId} not found`);
               return;
            }

            ws.send({
               type: EditorWSBodyContentType.OPEN,
               success: true,
               data: {
                  value: editor.content,
                  editorId,
                  cv: editor.contentVersion,
               },
            });
            ws.subscribe(editorId);

            editor.connections.add(ws.data.query.sid);
            activeSessions.add(ws.data.query.sid);
            await db.controller.saveEditor(editor);
         },
         async message(ws, body) {
            const editorId = ws.data.params.editorId;
            sendConsoleOutput(`Received message for editor ${editorId}`, 'normal', 'Elysia.Static');

            const editor = await db.controller.getEditorById(editorId);
            if (!editor) {
               ws.send({
                  success: false,
                  error: `NOT_FOUND`,
                  message: `Editor ${editorId} not found`,
               });
               return;
            }

            switch (body.type) {
               case EditorWSBodyContentType.UPDATES:
                  wsEditor_updates(ws, body, editor, editorId);
                  await db.controller.saveEditor(editor);
                  break;
               case EditorWSBodyContentType.SYNC_CHECK:
                  wsEditor_syncCheck(ws, body, editor, editorId);
                  break;
               case EditorWSBodyContentType.PING:
                  ws.send({
                     type: EditorWSBodyContentType.PONG,
                     data: {
                        ts: Date.now(),
                     },
                     success: true,
                  });
                  break;
               default:
                  ws.send({
                     success: false,
                     error: `INVALID_REQUEST`,
                     message: `Invalid request type`,
                  });
            }
         },
         async close(ws) {
            const editorId = ws.data.params.editorId;
            sendConsoleOutput(`WebSocket connection closed for editor ${editorId}`, 'normal', 'Elysia');

            const editor = await db.controller.getEditorById(editorId);

            if (!editor) {
               sendConsoleOutput(`Editor ${editorId} not found`, 'error', 'Elysia');
               return;
            }

            ws.unsubscribe(editorId);

            editor.connections.delete(ws.data.query.sid);
            activeSessions.delete(ws.data.query.sid);
            await db.controller.saveEditor(editor);
         }
      })
   )

export default apiRoutes;
