/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
interface ImportMetaEnv {  
  readonly VITE_TABLE_ID: number;

  readonly VITE_COLUMN_ID_NAME: string;
  readonly VITE_COLUMN_ID_ADOAZONOSITO: string;
  readonly VITE_COLUMN_ID_SZULETESI_IDO: string;
  readonly VITE_COLUMN_ID_SZULETESI_HELY: string;
  readonly VITE_COLUMN_ID_EFO_IGENYLO: string;
  //readonly VITE_COLUMN_ID_EFO_JOVAHAGYO: string;
  readonly VITE_COLUMN_ID_MUNKAKOR: string;
  readonly VITE_COLUMN_ID_KOLTSEGHELY: string;
  readonly VITE_COLUMN_ID_SZULETESI_NEV: string;
  readonly VITE_COLUMN_ID_ANYJA_NEVE: string;
  readonly VITE_COLUMN_ID_LAKCIM: string;
  readonly VITE_COLUMN_ID_ALLAMPOLGARSAG: string;
  readonly VITE_COLUMN_ID_TAJSZAM: string;
  readonly VITE_COLUMN_ID_BANKSZAMLASZAM: string;

  readonly VITE_KTGHELY_TABLE_ID: number;
  readonly VITE_COLUMN_ID_EFO_IGENYLO_KTG: string;
  readonly VITE_COLUMN_ID_EFO_JOVAHAGYO_KTG: string;
  readonly MONDAY_API_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}