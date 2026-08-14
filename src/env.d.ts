/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}

declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedReload?: () => void;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisteredSW?: (swUrl: string, registration: ServiceWorkerRegistration | undefined) => void;
    onRegistrationError?: (error: Error) => void;
  }

  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}

declare module 'mime-db' {
  interface MimeEntry {
    source?: string;
    charset?: string;
    compressible?: boolean;
    extensions?: string[];
  }
  const db: Record<string, MimeEntry>;
  export default db;
}
