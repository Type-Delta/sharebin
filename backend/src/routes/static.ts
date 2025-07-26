import { Elysia } from "elysia";

import config from "../config";
import { webResource } from '../web/builder';
import { responseLogger } from "../utilities";
import { compression } from "../web/compressor";

const staticRoutes = new Elysia()
   .onAfterResponse(({ path, request, set }) => {
      responseLogger(path, request, set, 'Static');
   })
   .use(compression({
      enabled: config.useCompression,
      encodings: config.compressionEncodings,
      threshold: config.compressionThreshold,
      useCache: [
         'assets/*.js',
         'assets/*.css',
         'index.html'
      ]
   }))
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
   .all("/*", async ({ set }) => {
      set.headers['Content-Type'] = 'text/html';
      return webResource.get('index.html')?.data || '404 Not Found';
   });

export default staticRoutes;
