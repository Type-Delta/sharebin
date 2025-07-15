

export function copyToClipboard(text: string): Promise<void> {
   return navigator.clipboard.writeText(text);
}


/**
 * get current preferred color scheme
 *
 * return `null` if browser doesn't support `matchMedia`
 */
export function getPreferredColorScheme() {
   if (!window.matchMedia) return null; // if browser doesn't support matchMedia
   return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function createHash(
   data: string,
   algorithm: 'sha1' | 'sha256' | 'sha512' = 'sha1',
   salt = ''
): Promise<string> {
   const encoder = new TextEncoder();
   const dataBuffer = encoder.encode(data + salt);
   return crypto.subtle.digest(algorithm, dataBuffer)
      .then(hashBuffer => {
         const hashArray = Array.from(new Uint8Array(hashBuffer));
         return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      });
}
