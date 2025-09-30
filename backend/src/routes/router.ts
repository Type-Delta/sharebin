import config from "../config";
import { webResource } from '../web/builder';
import { sendConsoleOutput } from '../utilities';
import { Err, yuString } from '../../../lib/esm/Tools';
import { stringifyQuery } from '../../../lib/esm/Griseo';
import { ApiFailedCode } from "../consts";
import { AnyObject } from "../types";


export function setRedirect(
   path: string,
   set: any, request: any,
   query?: AnyObject
): void {
   if (query) {
      path += '?' + stringifyQuery(query);
   }

   switch (request.method) {
      case 'POST':
         set.status = 306; // use in-place of 303
         set.headers['Location'] = path;
         return;
      default:
         set.status = 302;
         set.headers['Location'] = path;
   }
}





export function failureRespond(code: ApiFailedCode, set: any, error?: Error | string): any {
   switch (code) {
      case ApiFailedCode.INTERNAL_SERVER_ERROR:
         sendConsoleOutput(
            `Internal Server Error: ${yuString(error)}`,
            'error', 'Elysia'
         );

         set.status = 500;
         return {
            failed: true,
            failedCode: ApiFailedCode.INTERNAL_SERVER_ERROR,
            reason: 'Internal Server Error' + (error ? ': ' + yuString(error) : '')
         };
      case ApiFailedCode.RESOURCE_MISSING:
         set.status = 424;
         return {
            failed: true,
            failedCode: ApiFailedCode.RESOURCE_MISSING,
            reason: 'Resource Missing' + (error ? ': ' + yuString(error) : '')
         };
      case ApiFailedCode.SESSION_EXPIRED:
         set.status = 498;
         set.headers['Location'] = '/login';
         return {
            failed: true,
            failedCode: ApiFailedCode.SESSION_EXPIRED,
            reason: 'Session Expired' + (error
               ? ': ' + yuString(error)
               : ': Please login again')
         }
      case ApiFailedCode.BAD_REQUEST:
         set.status = 400;
         return {
            failed: true,
            failedCode: ApiFailedCode.BAD_REQUEST,
            reason: 'Bad Request' + (error
               ? ': ' + yuString(error)
               : ': Invalid request')
         };
      case ApiFailedCode.GONE:
         set.status = 410;
         return {
            failed: true,
            failedCode: ApiFailedCode.GONE,
            reason: 'Resource Gone' + (error
               ? ': ' + yuString(error)
               : ': Resource is no longer available')
         };
      case ApiFailedCode.USER_NOT_FOUND:
         set.status = 401;
         return {
            failed: true,
            failedCode: ApiFailedCode.USER_NOT_FOUND,
            reason: 'User Not Found' + (error
               ? ': ' + yuString(error)
               : ': No user found with given credentials')
         };
      case ApiFailedCode.NOT_FOUND:
         set.status = 404;
         return {
            failed: true,
            failedCode: ApiFailedCode.NOT_FOUND,
            reason: 'Not Found' + (error
               ? ': ' + yuString(error)
               : ': The requested resource cannot be found')
         };
   }

   set.status = 400;
   return {
      failed: true,
      failedCode: 'UNKNOWN',
   };
}



export function page(
   templateName: string, set: any,
   dynamicContParams?: any,
): string {
   let content = webResource.get(templateName + '.html');

   sendConsoleOutput(`Creating page: ${templateName}`, 'normal', 'Router');
   if (!content?.text) {
      sendConsoleOutput(`Failed to create page: ${templateName}`, 'error', 'Elysia');

      set.status = 404;
      try {
         content = webResource.get('404');
         if (content) return content.text || '404 not found';
      } catch (e) {
         console.error('While responding with code 404, got this error:\n' + Err.from(e).stack);
      }

      return '404 not found';
   }

   set.headers['Content-Type'] = 'text/html';
   content.evalDynamicContents?.(dynamicContParams);

   return content.text;
}



export function attachSession(session: any, sessionId: string, maxAge: number = config.sessionExpireTimeS) {
   session.value = { id: sessionId };
   session.expires = new Date(Date.now() + maxAge * 1000);
}

export function refreshSession(session: any, maxAge: number = config.sessionExpireTimeS) {
   if (!session.value?.id) return;

   session.expires = new Date(Date.now() + maxAge * 1000);
}
