import crypto from 'node:crypto';

import { EContentDiffObject } from './types'
import {
   ncc,
   IDGenerator,
   ex_length,
   strSplice,
   nearestNumber,
   strLimit
} from '../../lib/esm/Tools';

export type NCCColor = 'Black' | 'Red' | 'Green' | 'Yellow' | 'Blue' | 'Magenta' | 'Cyan' | 'White' | 'Reset' | 'Bright' | 'Dim' | 'Blink' | 'Invert' | 'Hidden' | 'BgBlack' | 'BgRed' | 'BgGreen' | 'BgYellow' | 'BgBlue' | 'BgMagenta' | 'BgCyan' | 'BgWhite' | 'None' | undefined;


export class SCOOption {
   /**color of this Message (only visible on TERMINAL)
    * @example color and formats available:
    * `Reset, Bright, Dim, Underscore, Blink, Inverse, Hidden`
    * fontcolor:
    * `Black, Red, Green, Yellow, Blue, Magenta, Cyan, White`
    * background color:
    * `BgBlack, BgRed, BgGreen, BgYellow, BgBlue, BgMagenta, BgCyan, BgWhite`
    */
   color?: NCCColor;
   /**Int define importance level of the Message,
    * ranging from 1 to 4;
    * **debug: 4, normal: 3, error: 2, critical: 1**
    */
   debugLevel: number = 3;
   /**prefix insert to the front of the message when logging
    */
   prefix: string | null | undefined = null;
   important: boolean = false;
   constructor({ color, debugLevel, prefix, important }: { color?: NCCColor, debugLevel?: number, prefix?: string, important?: boolean } = {}) {
      this.color = color;
      this.debugLevel = debugLevel ?? 3;
      this.prefix = prefix;
      this.important = important ?? false;
   }
}


export class MCJsonText {
   /****console Color:**
    * `Black, Red, Green, Yellow, Blue, Magenta, Cyan, White`
    */
   color?: 'Black' | 'Red' | 'Green' | 'Yellow' | 'Blue' | 'Magenta' | 'Cyan' | 'White' | null = null;
   /****background Color:**
    * `BgBlack, BgRed, BgGreen, BgYellow, BgBlue, BgMagenta, BgCyan, BgWhite`
    */
   bgColor?: 'BgBlack' | 'BgRed' | 'BgGreen' | 'BgYellow' | 'BgBlue' | 'BgMagenta' | 'BgCyan' | 'BgWhite' | null = null;
   /****console Formats**
    * `Reset, Bright, Dim, Italic, Blink, Reverse, Hidden`
    */
   formats?: ('Reset' | 'Bright' | 'Dim' | 'Italic' | 'Blink' | 'Invert' | 'Hidden')[] = [];
   /**make Forecolor Dim
    */
   dim?: boolean = false;
   /**italic text
    */
   italic?: boolean = false;
   /****Animated Text:** switch between Dim and Bright overtimes
    */
   blink?: boolean = false;
   /**switch Background - Foreground
    */
   invert?: boolean = false;
   /**make Text unreadable, to view it copy and paste elsewhere
    */
   hidden?: boolean = false;
   /**plain Text content
    */
   text: string | null = null;
   /**
    * @param {MCJsonText}mcText
    */
   static toString(mcText: MCJsonText) {
      let plain = '';
      if (mcText.formats && mcText.formats instanceof Array)
         mcText.formats.forEach(f => { plain += ncc(f) });
      if (mcText.dim) plain += ncc('Dim');
      if (mcText.italic) plain += ncc('Italic');
      if (mcText.blink) plain += ncc('Blink');
      if (mcText.invert) plain += ncc('Invert');
      if (mcText.hidden) plain += ncc('Hidden');

      if (mcText.color) plain += ncc(mcText.color);
      if (mcText.bgColor) plain += ncc(mcText.bgColor);

      return plain.concat(mcText.text + ncc());
   }

   toString() {
      return MCJsonText.toString(this);
   }
}


let logCache: string = '';


export function generateErrorReferCode() {
   const date = new Date();
   const timeStamp = date.toISOString()
      .slice(2, 11)
      .replace(/-/g, '') +
      date.toTimeString().slice(0, 8);
   return timeStamp + IDGenerator(undefined, 'CCCCCC');
}


/**send Text to Console
 *
 * @version 1.5.23
 * @param Text Text to send or Json Text in the same format Minecraft used
 * @param options [`colorCode`] replace of `color: string`, [`options.debugLevel`] defind importance level of the Message; **Alternatively**, `options` can also be used as *Presets*: `"debug", "normal", "warn", "error", "critical"`
 * @param prefix the header for this message
 * @param color color or format of the Terminal(Node Console) Text.
 * @example
 * format available: `Reset, Bright, Dim, Italic, Blink, Invert, Hidden`
 * fontcolor: `Black, Red, Green, Yellow, Blue, Magenta, Cyan, White`
 * background color: `BgBlack, BgRed, BgGreen, BgYellow, BgBlue, BgMagenta, BgCyan, BgWhite`
 * @example // Usage
 * sendConsoleOutput('some normal text...');
 *
 * sendConsoleOutput('oh no! an Error in the code :O', 'error');
 *
 * sendConsoleOutput('just some Green debug text', {
 *     color: 'Green',
 *     debugLevel: 4
 * });
 *
 * sendConsoleOutput('this text can only be seen on Console',{
 *     displayMode: "CONSOLE_ONLY"
 * });
 *
 * sendConsoleOutput('message with prefix', 'normal', 'Nice Prefix', 'green');
 *
 * sendConsoleOutput([
 *       {text: 'f', color: 'green', italic: true, bgColor: 'white'},
 *       {text: 'a', color: 'yellow', italic: true, bgColor: 'white'},
 *       {text: 'n', color: 'cyan', italic: true, bgColor: 'white'},
 *       {text: 'c', color: 'white', italic: true, bgColor: 'white'},
 *       {text: 'y', color: 'Magenta', italic: true, bgColor: 'white'},
 * ]);
 * @returns {Promise<string>} text that has been send
*/
export async function sendConsoleOutput(
   Text: string | MCJsonText | MCJsonText[],
   options?: SCOOption | 'debug' | 'normal' | 'warn' | 'error' | 'critical' | null,
   prefix?: string | null,
   color?: NCCColor | 'None'
): Promise<string | void> {
   let ignoreDefColor = false;
   let dbLevel = 0;
   let consTxt = parseStr(Text);
   let pconsTxt = parsePlain(Text);
   let prefixTxt: string | null = null;
   let colorCode: string | null = null;

   if (typeof options != 'object' || !options) {
      switch (options) { //switch preset
         case 'debug':
            dbLevel++;
         case 'normal':
         case null:
         case undefined:
            // if `important` or  `color` is set, break;
            if (((typeof prefix == 'string' ? false : prefix) ?? false) || color) {
               dbLevel = 0;
               break;
            }
            dbLevel++;
         case 'warn':
         case 'error':
            dbLevel++;
         case 'critical':
            dbLevel++;
            options = new SCOOption({
               important: dbLevel < 3 && options != 'warn',
               color: dbLevel == 4 ? color || 'Dim' : (dbLevel > 2 ? color ?? undefined : (options == 'warn' ? 'Yellow' : 'Red')),
               debugLevel: dbLevel, //debug: 4, normal: 3, error: 2, critical: 1
               /**arg `important` also can be use for definding `prefix`
                * and in that case `important` would be a string
               */
               prefix: typeof prefix == 'string' ? prefix : undefined
            });
            break;
      }

      // if preset is omitted and/or options is not an Object
      if (!dbLevel) {
         options = new SCOOption({
            important: (typeof prefix == 'string' ? false : prefix) ?? false,
            color: color,
            debugLevel: 3,
            prefix: typeof prefix == 'string' ? prefix : undefined
         })
      }
   }

   if (!(options instanceof SCOOption)) return;

   if (options?.prefix) {
      prefixTxt = `\x1b[47m\x1b[30m ${options.prefix} \x1b[0m`;
      pconsTxt = `${options.prefix}: `.concat(pconsTxt);
   }


   // create indent for each line to match the prefix
   if (options.prefix) {
      const typePrefixLength = options.debugLevel == 1 ? 12 :
         (options.debugLevel == 2 ? (options.important ? 7 : 13) : 0);
      consTxt = consTxt.replace(/\n/g, '\n'.padEnd(ex_length(options.prefix) + typePrefixLength + 4, ' '));
   }

   logCache += (prefixTxt ? `${prefixTxt} ` : '') + consTxt + '\n';

   if (options.color != 'None') {
      colorCode = ncc(options.color);
   }

   if (colorCode && !ignoreDefColor) {
      if (options.debugLevel == 1) console.warn(
         `${ncc('Yellow')}${ncc('BgRed')} Critical \x1b[0m` + (prefixTxt ? prefixTxt : '') + ` ${colorCode}${consTxt}\x1b[0m`
      );
      else if (options.important && options.debugLevel == 2) console.warn(
         `${ncc('Black')}${ncc('BgRed')} Error \x1b[0m` + (prefixTxt ? prefixTxt : '') + ` ${colorCode}${consTxt}\x1b[0m`
      );
      else if (options.debugLevel == 2) console.warn(
         `${ncc('Black')}${ncc('BgYellow')} Warning! \x1b[0m` + (prefixTxt ? prefixTxt : '') + ` ${colorCode}${consTxt}\x1b[0m`
      );
      else console.log((prefixTxt ? prefixTxt : '') + ` ${colorCode}%s\x1b[0m`, consTxt);

   } else { //ignores colorCode
      if (options.debugLevel == 1) console.warn(
         `${ncc('Yellow')}${ncc('BgRed')} Critical \x1b[0m` + (prefixTxt ? prefixTxt : '') + ` ${consTxt}`
      );
      else if (options.important && options.debugLevel == 2) console.warn(
         `${ncc('Black')}${ncc('BgRed')} Error \x1b[0m` + (prefixTxt ? prefixTxt : '') + ` ${consTxt}`
      );
      else if (options.debugLevel == 2) console.warn(
         `${ncc('Black')}${ncc('BgYellow')} Warning! \x1b[0m` + (prefixTxt ? prefixTxt : '') + ` ${consTxt}`
      );
      else console.log((prefixTxt ? prefixTxt + ' ' : ' ') + consTxt);
   }

   return pconsTxt;


   /**
    * @param {string|MCJsonText|MCJsonText[]}cText
    */
   function parseStr(cText: string | MCJsonText | MCJsonText[]) {
      let plain = '';
      if (typeof (cText) == 'string') plain = cText;
      else if (cText instanceof Array) {
         for (let ct of cText) {
            if (typeof ct == 'string') plain += ct;
            else if (ct instanceof Object && !(ct instanceof Array)) {
               plain = plain.concat(MCJsonText.toString(ct));
               if (ct.color) ignoreDefColor = true;
            }
         }
      } else if (cText instanceof Object) {
         plain = plain.concat(MCJsonText.toString(cText));
         if (cText.color) ignoreDefColor = true;
      } else throw new Error('@slmo5f | Object not a valid format');

      return plain;
   }

   /**similar to parseStr() but ignores all formatting
    * @param {string|MCJsonText|MCJsonText[]}cText
    */
   function parsePlain(cText: string | MCJsonText | MCJsonText[]) {
      let plain = '';
      if (typeof (cText) == 'string') plain = cText;
      else if (cText instanceof Array) {
         for (let ct of cText) {
            if (typeof ct == 'string') plain += ct;
            else if (ct instanceof Object && !(ct instanceof Array)) {
               plain = plain.concat(ct.text ?? '');
            }
         }
      } else if (cText instanceof Object)
         plain = plain.concat(cText.text ?? '');
      else throw new Error('@mu35a2 | Object is not a valid format');

      return plain;
   }
}



/**
 * tokenize SQL query, coloring keywords and strings
 */
export function tokenizeSQL(sql: string): string {
   const keywords_reg = /(?<=\W?)[A-Z_]+(?=\W)|([^A-Z_."'a-z0-9 \n\r\t]+)|(["'][ A-Za-z0-9_]+["'])/g;

   return sql.replace(keywords_reg, (match, cap0, cap1) => {
      if (cap0)
         return ncc('Dim') + cap0 + ncc();
      if (cap1)
         return ncc('Green') + cap1 + ncc();
      return ncc(0x3a96dd) + match + ncc();
   });
}


/**
 * create hash from string
 */
export function createHash(
   data: string,
   algorithm: 'sha1' | 'sha256' | 'sha512' = 'sha1',
   salt = ''
): string {
   return crypto.createHash(algorithm)
      .update(data + salt)
      .digest('hex');
}



export function popLetestLogs(): string {
   let log = logCache;
   logCache = '';
   return log;
}



export function genUniqueNumber(existedNumbers: number[]): number {
   let num;
   do {
      num = Math.floor(Math.random() * 1000000);
   }
   while (existedNumbers.includes(num))

   return num;
}


export function resolveDiff(original: string, diff: EContentDiffObject[]): string {
   let result = original;

   for (let { index, value, rmLength } of diff) {
      result = strSplice(result, index, rmLength ?? 0, value);
   }

   return result;
}

export function globMatch(
   pattern: string,
   str: string
): boolean {
   const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
   );
   return regex.test(str);
}

export function responseLogger(path: string, request: Request, set: any, routePrefix: string) {
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
      'normal', ncc(0xd778e9) + 'Elysia.' + routePrefix
   );
}
