const buffer = new Map<string, string>();

/**
 * Fetches the content of a URL and caches it.
 *
 * ! **Only supports text responses for now.**
 */
async function get(url: string): Promise<{ data: string, status: number, error?: string }> {
   if (buffer.has(url)) {
      return Promise.resolve({ data: buffer.get(url)!, status: 200 });
   }

   const res = await fetch(url);
   if (!res.ok) {
      return { data: '', status: res.status, error: `HTTP error! status: ${res.status}` };
   }

   const data = await res.text();
   buffer.set(url, data);
   return { data, status: 200 };
}


export default {
   get,
};
