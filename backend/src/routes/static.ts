import { Elysia } from "elysia";

import { webResource } from '../web/builder';

const staticRoutes = new Elysia()
   .get("/assets/:file", async ({ params: { file }, set }) => {
      const content = webResource.get(file);
      set.headers['Content-Type'] = content?.type || 'text/plain';
      return content?.data || '404 Not Found';
   })
   .get("/favicon.ico", async ({ set }) => {
      const content = webResource.get('favicon.ico');
      set.headers['Content-Type'] = content?.type || 'image/x-icon';
      return content?.data || '404 Not Found';
   })

export default staticRoutes;
