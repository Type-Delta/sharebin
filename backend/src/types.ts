import { BunFile } from "bun";
import { Cookie } from "elysia";

import {
   t_EDataContentDiff,
   t_EditorWSBodyRequest,
   t_EditorWSUpdateReq,
   t_EditorWSSyncCheckReq,
   t_EditorWSLanguageChangeReq
} from "./dto/reqest.dto";
import {
   t_EditorWSUpdateRes,
   t_EditorWSBodyResponse,
   t_EditorWSSyncCheckRes
} from "./dto/response.dto";

////   Utility Types   ////
export type AnyObject = { [key: string]: any };



///////////   Backend Types   ///////////
export type SessionCookie = Cookie<{
   id: string;
} | undefined>;

export type WebContent = {
   data: BunFile;
   text?: string;
   type: string;
   name: string;
   evalDynamicContents?: (dynamicContParams?: any) => void;
}

export type EditorContext = {
   content: string;
   connections: Map<string, any>;
   contentVersion: number;
   lastModified: Date;
}

export interface Session {
   uid: number;
}

export enum EditorWSBodyContentType {
   UPDATES,
   OPEN,
   SYNC_CHECK,
   PING,
   PONG,
   LANGUAGE_CHANGE,
}

export type EContentDiffObject = typeof t_EDataContentDiff.static;
export type EditorWSOpenRes = typeof t_EditorWSUpdateRes.static;
export type EditorWSUpdateRes = EditorWSOpenRes;
export type EditorWSBodyResponse = typeof t_EditorWSBodyResponse.static
export type EditorWSBodySyncCheckRes = typeof t_EditorWSSyncCheckRes.static;

export type EditorWSBodyRequest = typeof t_EditorWSBodyRequest.static;
export type EditorWSUpdateReq = typeof t_EditorWSUpdateReq.static;
export type EditorWSSyncCheckReq = typeof t_EditorWSSyncCheckReq.static;
export type EditorWSLanguageChangeReq = typeof t_EditorWSLanguageChangeReq.static;
///////////   Frontend Types   ///////////




///////////   Configurations   ///////////
export interface WebConstants {
   SITE_NAME: string;
}

export interface FrontendConfig {
   /**
    * how different Tags should be displayed (case-insensitive)
      Tag name -> Tag color

      PrimeVue Tag Severity VS Bootstrap Color
      "danger" -> red
      "success" -> green
      "info" -> blue
      "warn" -> yellow
    */
   primeVueTagSeverity: {
      [key: string]: 'success' | 'info' | 'warn' | 'danger';
   };
}

export type DatabaseSourceConfig = {
   [sourceName: string]: {
      host: string;
      port: number;
      dbName: string;
      username?: string;
      password?: string;
   }
}
