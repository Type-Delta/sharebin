import { Elysia } from "elysia";
import { cors } from '@elysiajs/cors'

import {
   strLimit,
   ncc,
   nearestNumber,
} from '../../lib/esm/Tools';
import { sendConsoleOutput } from './utilities';
import config from './config';
import database from './database';
import { loadWebResource } from './web/builder';

import staticRoutes from "./routes/static";
import apiRoutes from "./routes/api";


database.connect();
loadWebResource();

const app = new Elysia({
   cookie: {
      secrets: [config.cookieSecret],
      sign: ['session']
   },
   serve: {
      hostname: '0.0.0.0',
   }
})
   .use(cors())
   .onAfterResponse(({ path, request, set }) => {
      const code: number = set.status as number;
      const range = nearestNumber([250, 350, 450, 550], code);
      let codeColor: 'BgWhite' | 'BgGreen' | 'BgYellow' | 'BgRed' | 'BgMagenta' = 'BgWhite';
      switch (range) {
         case 0: codeColor = 'BgGreen'; break;
         case 1: codeColor = 'BgYellow'; break;
         case 2: codeColor = 'BgRed'; break;
         case 3: codeColor = 'BgMagenta'; break;
      }

      sendConsoleOutput(
         `Responded to ${ncc('Dim') + ncc('Bright') + request?.method} - ${strLimit(path, 35, 'mid') + ncc()} with code ${ncc(codeColor) + ncc('Black')} ${code + ' ' + ncc()}`,
         'normal', ncc(0xd778e9) + 'Elysia.Router'
      );
   })
   .use(apiRoutes)
   .use(staticRoutes)
   .listen(5000);

sendConsoleOutput(
   `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
   'normal', ncc(0xd778e9) + 'Elysia'
);


export type App = typeof app;
