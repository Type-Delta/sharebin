import path from 'path';
import fs from 'fs';
import config from '../config';
import { WebContent } from '../types';
import { sendConsoleOutput } from '../utilities';
import { BunFile } from 'bun';
import Tools from '../../../lib/esm/Tools';
const { ncc } = Tools;

export const webResource = new Map<string, WebContent>();



export async function loadWebResource(): Promise<void> {
   const startTime = Date.now();
   let files: {
      name: string;
      blob: BunFile;
   }[] = [];

   for (const folder of ['assets', '.']) {
      const content = fs.readdirSync(path.join(config.webRoot, folder), { withFileTypes: true });
      const fileContent = content.filter(f => f.isFile()).map(f => f.name);

      files.push(
         ...fileContent.map(fName => ({
            name: fName,
            blob: Bun.file(path.join(config.webRoot, folder, fName))
         }))
      );
   }

   webResource.clear();

   for (const file of files) {
      webResource.set(file.name, {
         data: file.blob,
         type: file.blob.type.split(';')[0],
         name: file.name
      });
   }

   sendConsoleOutput(
      `Web Resources loaded in ${ncc('Magenta')}${Date.now() - startTime}ms` + ncc(),
      'normal', 'Builder'
   );
}




export function resolveContentType(ext: string) {
   switch (ext) {
      case 'html':
         return 'text/html';
      case 'css':
         return 'text/css';
      case 'js':
         return 'text/javascript';
      case 'png':
         return 'image/png';
      case 'jpg':
         return 'image/jpeg';
      case 'jpeg':
         return 'image/jpeg';
      case 'gif':
         return 'image/gif';
      case 'svg':
         return 'image/svg+xml';
      case 'ico':
         return 'image/x-icon';
      case 'json':
         return 'application/json';
      default:
         return 'text/plain';
   }
}
