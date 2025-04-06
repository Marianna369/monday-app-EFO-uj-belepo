/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
interface ImportMetaEnv {  
  readonly VITE_TABLE_ID: number;

  readonly VITE_COLUMN_ID_NAME: string;
  readonly VITE_COLUMN_ID_SZULETESI_IDO: string;
  readonly VITE_COLUMN_ID_SZULETESI_HELY: string;
  readonly VITE_COLUMN_ID_EFO_IGENYLO: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}