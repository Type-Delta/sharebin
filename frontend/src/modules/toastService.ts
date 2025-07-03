export { useToast } from 'primevue/usetoast';
import { type ToastServiceMethods } from 'primevue/toastservice';

let toastInstance: ToastServiceMethods | null = null; // to keep the instance
let resolver: ((toast: ToastServiceMethods) => void);

const toastReady = new Promise<ToastServiceMethods>((resolve) => {
   // Move resolve() to the outer scope
   resolver = resolve;
});

function setInstance(toast: ToastServiceMethods) {
   toastInstance = toast;
   resolver(toast); // Only now; `toastReady` is resolved
}

async function getService() {
   if (toastInstance) return toastInstance;
   return toastReady;
}

async function add(options: Parameters<ToastServiceMethods['add']>[0]) {
   const toast = await getService(); // only resolve when the instance is ready
   toast.add(options);
}


export default {
   setInstance,
   getService,
   add,
} as const;
