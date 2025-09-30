import { Elysia, t } from "elysia";

import { IDGenerator } from '../../../lib/esm/Tools';
import { responseLogger, sendConsoleOutput } from '../utilities';
import { t_EditorWSBodyRequest } from "../dto/reqest.dto";
import { t_BaseResponse, t_EditorWSBodyResponse } from "../dto/response.dto";
import { EditorWSBodyContentType, t_AppHealth } from "../types";
import { wsEditor_setLanguage, wsEditor_syncCheck, wsEditor_updates } from "../handlers/websocket";
import db from "../database";
import { setRedirect } from "./router";
import healthCheck from "../handlers/healthCheck";



const activeSessions: Set<string> = new Set();
const pendingSessions: Set<string> = new Set();


const apiRoutes = new Elysia()
   .onAfterResponse(({ path, request, set }) => {
      responseLogger(path, request, set, 'Api');
   })
   .group("api/v1", (app) => app
      .get("/health", async ({ set }) => {
         const res = await healthCheck();

         if (res.status !== 'ok') {
            set.status = 500;
         }
         return res;
      }, {
         response: t.Object(t_AppHealth.properties)
      })
      .get("/e/:editorId/session", async ({ params, set }) => {
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

         pendingSessions.add(sid);

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
         const conflictList: string[] = [];

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

            if (!pendingSessions.has(ws.data.query.sid)) {
               sendConsoleOutput(`Request to connect to editor ${editorId} failed: Session ID ${ws.data.query.sid} not found`, 'error', 'Elysia');
               ws.close(4404, `Session ID ${ws.data.query.sid} not found`);
               return;
            }

            const editor = await db.controller.getEditorById(editorId);
            if (!editor) {
               sendConsoleOutput(`Request to connect to editor ${editorId} failed: editor not found`, 'error', 'Elysia');
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
                  lang: editor.language ?? undefined,
               },
            });
            ws.subscribe(editorId);

            pendingSessions.delete(ws.data.query.sid);
            editor.connections = editor.connections.filter(v => activeSessions.has(v));
            editor.connections.push(ws.data.query.sid);
            activeSessions.add(ws.data.query.sid);
            await db.controller.saveEditor(editor);
         },
         async message(ws, body) {
            const editorId = ws.data.params.editorId;
            sendConsoleOutput(`Received message for session ${ws.data.query.sid} -> ${editorId} (content type: ${body.type})`, 'debug', 'Elysia.Static');

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
                  wsEditor_updates(ws, body, editor, editorId); // TODO: date not sync
                  await db.controller.saveEditor(editor);
                  break;
               case EditorWSBodyContentType.SYNC_CHECK:
                  wsEditor_syncCheck(ws, body, editor);
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
               case EditorWSBodyContentType.LANGUAGE_CHANGE:
                  await wsEditor_setLanguage(ws, body, editor, editorId);
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
            sendConsoleOutput(`WebSocket connection closed for session ${ws.data.query.sid} -> ${editorId}`, 'normal', 'Elysia');

            const editor = await db.controller.getEditorById(editorId);

            if (!editor) {
               sendConsoleOutput(`Request to close editor ${editorId} failed: editor not found`, 'error', 'Elysia');
               return;
            }

            ws.unsubscribe(editorId);

            editor.connections = editor.connections.filter(v => v !== ws.data.query.sid);
            activeSessions.delete(ws.data.query.sid);
            await db.controller.saveEditor(editor);
         }
      })
   )

export default apiRoutes;
