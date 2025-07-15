import { treaty as Treaty } from '@elysiajs/eden';

import type { App } from '@server/index';
import toast from '@/modules/toastService';

import router from '@/router/index';




/**
 * client object that connects to the server
 * for type-safe fetch requests
 */
// @ts-ignore
export const client = Treaty<App>('http://localhost:5000');


export async function connectEditor(
   id: string
): Promise<{ connection: any, error: string | null, status?: number }> {
   console.log(`Connecting to editor with ID: ${id}`);

   return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
         console.error(`Connection to editor ${id} timed out`);
         resolve({ connection: null, error: `Connection timed out` });
      }, 5000); // 5 seconds connection timeout

      try {
         const { data, error, status } = await client.api.v1.e({ editorId: id }).session.get();
         if (error) {
            console.error(`Error fetching session for editor ${id}:`, error);
            resolve({ connection: null, error: error.value.message, status });
            return;
         }

         const connection = client.api.v1.e({ editorId: id }).subscribe({
            query: {
               sid: (data as any).value,
            },
         });


         connection.on('open', ev => {
            clearTimeout(timeoutId);
            console.log(`WebSocket connection opened for editor ${id}`);
            resolve({ connection, error: null, status: 200 });
         });
      }
      catch (error) {
         console.error(`Error connecting to editor ${id}:`, error);
         resolve({ connection: null, error: 'FETCH_ERROR', status: 400 });
      }
   });
}


export async function redirectNewEditor() {
   try {
      const { data, error } = await client.api.v1.e.new.get({ query: { redirect: false } });
      if (error) {
         throw error;
      }

      if (!data.success) {
         console.error(`Failed to create editor:`, data.error);
         toast.add({
            severity: 'error',
            summary: 'Error',
            detail: `Failed to create new editor: ${data.error}`,
            life: 5000,
         });
         return;
      }

      const editorId = data.value;
      console.log(`Editor created with ID: ${editorId}`);
      router.push(`/editor/${editorId}`);
      console.log(`Redirecting to editor with ID: ${editorId}`);
      return editorId;
   }
   catch (error) {
      console.error(`Failed to create editor:`, error);
      toast.add({
         severity: 'error',
         summary: 'Error',
         detail: `Failed to create new editor: ${error.value ?? error.message}`,
         life: 5000,
      });
   }
}
