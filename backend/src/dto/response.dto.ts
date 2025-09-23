import { t } from 'elysia';

import { EditorWSBodyContentType } from '../types';

export const t_BaseResponse = t.Object({
   success: t.Boolean(),
   message: t.Optional(t.String()),
   error: t.Optional(t.String()),
});

export const t_BaseErrorResponse = t.Object({
   ...t_BaseResponse.properties,
   success: t.Literal(false),
   error: t.String(),
});

export const t_WSBaseResponse = t.Object({
   ...t_BaseResponse.properties,
   success: t.Literal(true),
   type: t.Union([
      t.Literal(EditorWSBodyContentType.UPDATES),
      t.Literal(EditorWSBodyContentType.OPEN),
      t.Literal(EditorWSBodyContentType.SYNC_CHECK),
      t.Literal(EditorWSBodyContentType.PONG),
   ])
});


export const t_EditorWSUpdateRes = t.Object({
   ...t_WSBaseResponse.properties,
   success: t.Literal(true),
   type: t.Union([
      t.Literal(EditorWSBodyContentType.UPDATES),
      t.Literal(EditorWSBodyContentType.OPEN)
   ]),
   data: t.Object({
      value: t.Optional(t.String()),
      editorId: t.String(),
      cv: t.Number(), // content version
      lang: t.Optional(t.String()),
   }),
});

export const t_EditorWSSyncCheckRes = t.Object({
   ...t_WSBaseResponse.properties,
   success: t.Literal(true),
   type: t.Literal(EditorWSBodyContentType.SYNC_CHECK),
   data: t.Object({
      contentMatches: t.Boolean(),
      cvMatches: t.Boolean(),
      hash: t.Optional(t.String()),
      value: t.Optional(t.String()),
      cv: t.Optional(t.Number()),
   }),
});

export const t_EditorWSPongRes = t.Object({
   ...t_WSBaseResponse.properties,
   success: t.Literal(true),
   type: t.Literal(EditorWSBodyContentType.PONG),
   data: t.Object({
      ts: t.Number(),
   }),
});



export const t_EditorWSBodyResponse = t.Union([
   t_BaseErrorResponse,
   t_EditorWSUpdateRes,
   t_EditorWSSyncCheckRes,
   t_EditorWSPongRes,
   t_BaseResponse
]);
