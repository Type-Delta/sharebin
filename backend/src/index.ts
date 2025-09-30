import { Elysia } from "elysia";
import { cors } from '@elysiajs/cors'

import { ncc } from '../../lib/esm/Tools';
import { sendConsoleOutput } from './utilities';
import config from './config';
import database from './database';
import { loadWebResource } from './web/builder';

import staticRoutes from "./routes/static";
import apiRoutes from "./routes/api";
import { initScheduledTasks } from "./tasks";

loadWebResource();
database.connect()
   .then(initScheduledTasks);

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
   .use(apiRoutes)
   .use(staticRoutes)
   .listen(5000);

sendConsoleOutput(
   `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
   'normal', ncc(0xd778e9) + 'Elysia'
);


export type App = typeof app;
