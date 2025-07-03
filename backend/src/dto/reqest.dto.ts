import { t } from 'elysia';

import { EditorWSBodyContentType } from '../types';

export const t_CookieWithSession = t.Cookie({
   session: t.Optional(t.Object({
      id: t.String()
   }))
});

export const t_EDataContentDiff = t.Object({
   value: t.Optional(t.String()),
   index: t.Number(),
   rmLength: t.Optional(t.Number()),
});
export const t_EditorWSUpdateReq = t.Object({
   type: t.Literal(EditorWSBodyContentType.UPDATES),
   data: t.Array(t_EDataContentDiff)
});

export const t_EWSSyncHash = t.Object({
   cv: t.Number(),
   hash: t.String(),
});
export const t_EditorWSSyncCheckReq = t.Object({
   type: t.Literal(EditorWSBodyContentType.SYNC_CHECK),
   data: t_EWSSyncHash
});

export const t_EditorWSPingReq = t.Object({
   type: t.Literal(EditorWSBodyContentType.PING),
   data: t.Object({
      ts: t.Number(),
   }),
});

export const t_EditorWSBodyRequest = t.Union([
   t_EditorWSUpdateReq,
   t_EditorWSSyncCheckReq,
   t_EditorWSPingReq,
])
