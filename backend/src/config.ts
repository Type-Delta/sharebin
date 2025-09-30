import { readFileSync } from 'fs';
import path from 'path';

import { parseConfig, remap } from '../../lib/esm/Tools';
import { WebConstants, FrontendConfig, DatabaseSourceConfig } from './types';

const configLocation = './config.ini';



class Config {
   devMode: boolean = false;
   webRoot!: string;
   sessionExpireTimeS: number = 3600;
   sessionCleanupIntervalH: number = 1;
   globalScheduleTaskIntervalM: number = 10;
   searchMatchThreshold: number = 0.6;
   searchUseTFIDFMaps: boolean = false;
   useCompression: boolean = true;
   compressionEncodings: string[] = ['br', 'gzip', 'deflate'];
   compressionThreshold: number = 2048; // 2KB
   editorTTLDays: number = 90;
   webConstants!: WebConstants;
   databases!: DatabaseSourceConfig;
   frontendConfig!: FrontendConfig;
   // sessionDBPath!: string;
   cookieSecret!: string;

   constructor() {
      this.load();
   }

   load() {
      const config = parseConfig(readFileSync(configLocation, 'utf-8'));

      Object.assign(
         this,
         remap<string, unknown, string, unknown>(config.ServerConfig, k => {
            if (!Object.prototype.hasOwnProperty.call(Config.prototype, k)) return; // remove unknown or inherited properties
            return null; // else keep the rest unchanged
         })
      );

      this.webRoot = path.resolve(process.cwd(), config.ServerConfig.webRoot);
      this.frontendConfig = config.FrontendConfig;
      this.databases = config.DatabaseConfig.databases;
   }
}


export default new Config();
