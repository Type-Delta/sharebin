

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
