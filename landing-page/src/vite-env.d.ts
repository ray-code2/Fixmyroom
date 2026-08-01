/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend base URL, e.g. http://localhost:8080. Endpoint paths are appended by callers.
   *  Optional: when unset, lead capture degrades to localStorage (see leadApi.ts). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
