import { readFileSync } from 'fs';
import path from 'path';

import Tools from '../../lib/esm/Tools';
const { parseConfig } = Tools;
import { WebConstants, FrontendConfig, DatabaseSourceConfig } from './types';

const configLocation = './config.ini';



class Config {
   devMode: boolean = false;
   webRoot!: string;
   sessionExpireTimeS: number = 3600;
   sessionCleanupIntervalH: number = 1;
   roomCheckInTimeLimitM: number = 30;
   globalScheduleTaskIntervalM: number = 10;
   searchMatchThreshold: number = 0.6;
   searchUseTFIDFMaps: boolean = false;
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

      if (config.ServerConfig.devMode) this.devMode = true;
      this.webRoot = path.resolve(process.cwd(), config.ServerConfig.webRoot);
      this.cookieSecret = config.ServerConfig.cookieSecret;
      this.webConstants = config.ServerConfig.webConstants;
      if (config.sessionExpireTime)
         this.sessionExpireTimeS = config.ServerConfig.sessionExpireTimeS;
      if (config.globalScheduleTaskIntervalM)
         this.globalScheduleTaskIntervalM = config.ServerConfig.globalScheduleTaskIntervalM;

      this.frontendConfig = config.FrontendConfig;

      this.databases = config.DatabaseConfig.databases;
   }
}



// const c = new Config();
export default new Config();
