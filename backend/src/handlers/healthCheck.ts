import { execSync } from "node:child_process";

import { AppHealth } from "../types";
import db from "../database";
import { webResource } from "../web/builder";
import { getLetestLogs } from "../utilities";

export default async function healthCheck(): Promise<AppHealth> {
   const defaultRes: AppHealth = {
      status: 'pending',
      uptime: 0,
      details: {
         database: 'pending',
         webResource: 'pending',
         network: 'pending',
      }
   };

   if (await db.ping()) {
      defaultRes.details!.database = 'ok';
   }
   else {
      defaultRes.status = defaultRes.details!.database = 'error: database is not reachable';
   }

   if (webResource.size > 0) {
      defaultRes.details!.webResource = 'ok';
   }
   else {
      defaultRes.status = defaultRes.details!.webResource = 'error: web resources not loaded';
   }

   try {
      execSync(`ping ${process.platform === 'win32' ? '-n' : '-c'} 1 8.8.8.8`);
      defaultRes.details!.network = 'ok';
   } catch {
      defaultRes.status = defaultRes.details!.network = 'error: network is unreachable';
   }

   if (defaultRes.status === 'pending') {
      defaultRes.status = 'ok';
   }

   defaultRes.logs = getLetestLogs();
   defaultRes.uptime = process.uptime();
   return defaultRes;
}
