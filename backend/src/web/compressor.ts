import { Elysia } from 'elysia';
import { brotliCompressSync, gzipSync, deflateSync } from 'node:zlib';

import { globMatch, sendConsoleOutput } from '../utilities';

interface CompressionOptions {
   encodings: string[];
   threshold: number;
   useCache: string[] | boolean;
   enabled: boolean;
}

const compressors = {
   br: (buffer: Buffer) => brotliCompressSync(buffer),
   gzip: (buffer: Buffer) => gzipSync(buffer),
   deflate: (buffer: Buffer) => deflateSync(buffer)
};

export const responseCache: Record<string, Response> = {};

export const compression = (
   options: Partial<CompressionOptions> = {}
) => {
   const app = new Elysia({ name: 'elysia-compress' });

   options = {
      encodings: ['br', 'gzip', 'deflate'],
      threshold: 1024,
      useCache: false,
      enabled: true,
      ...options
   } as CompressionOptions;

   // This is how you obtain the new mapResponse in the latest Elysia version
   const mapResponse = app['~adapter'].handler.mapResponse;
   options.encodings = options.encodings!.filter(isValidEncoding);

   app.mapResponse(async (ctx) => {
      const encoding = ctx.headers['accept-encoding']
         ?.split(', ')
         .find((enc) => options.encodings!.includes(enc)) as keyof typeof compressors;

      if (!encoding) return;

      if (typeof ctx.set.status === 'number' && (ctx.set.status < 200 || ctx.set.status >= 300)) {
         return; // Do not compress error responses
      }

      const contentLength = guessContentLength(ctx.response);
      if (contentLength && contentLength < options.threshold!) {
         return; // Do not compress responses smaller than the threshold
      }

      const cacheEnabled = typeof options.useCache === 'boolean'
         ? options.useCache
         : options.useCache!.some(pattern => globMatch(pattern, ctx.path));
      let response: Response | undefined;

      if (cacheEnabled && (response = responseCache[ctx.path])) {
         queueMicrotask(() => {
            sendConsoleOutput(
               `Serving cached response for ${ctx.path} with ${encoding} encoding`,
               'normal', 'Elysia.Compression'
            );
         });
         return response;
      }

      const res = mapResponse(ctx.response, { headers: {} });

      if (!(res instanceof Response)) return;
      ctx.set.headers['Content-Encoding'] = encoding;

      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      response = new Response(compressors[encoding](buffer), {
         headers: {
            'Content-Type': String(ctx.set.headers['Content-Type'] ?? 'text/plain')
         }
      });

      if (cacheEnabled) {
         responseCache[ctx.path] = response;
      }

      queueMicrotask(() => {
         sendConsoleOutput(
            `Compressed response for ${ctx.path} with ${encoding} encoding`,
            'normal', 'Elysia.Compression'
         );
      });

      return response;
   });

   sendConsoleOutput(
      `Compression middleware initialized with encodings: ${options.encodings.join(', ')}`,
      'normal', 'Elysia'
   );

   return app.as('scoped');
}


function isValidEncoding(encoding: string): encoding is keyof typeof compressors {
   return Object.keys(compressors).includes(encoding)
}


function guessContentLength(response: unknown): number | null {
   if (!response) return null;

   if (response instanceof Response) {
      const contentLength = response.headers.get('Content-Length');
      return contentLength ? parseInt(contentLength) : null;
   }

   if (response instanceof Blob) {
      return response.size;
   }

   const susProperties = ['length', 'size'];
   for (const prop of susProperties) {
      // @ts-expect-error string can't be used as a key here
      if (response[prop] !== undefined) {
         const value = (response as any)[prop];
         if (typeof value === 'number') {
            return value;
         }
      }
   }

   return null;
}
