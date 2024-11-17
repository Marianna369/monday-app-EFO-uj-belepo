/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
interface ImportMetaEnv {  
  readonly VITE_TABLE_ID: number;
  readonly VITE_OUTGOING_GROUP_ID: string;
  readonly VITE_INCOMING_GROUP_ID: string;
  readonly VITE_IKTATVA_STATUS_ID: string;
  readonly VITE_IKTATVA_STATUS_LABEL: string;
  readonly VITE_KISZIGNALVA_STATUS_ID: string;
  readonly VITE_KISZIGNALVA_STATUS_LABEL: string;
  readonly VITE_TOROLVE_STATUS_ID: string;
  readonly VITE_TOROLVE_STATUS_LABEL: string;

  readonly VITE_COLUMN_ID_NAME: string;
  readonly VITE_COLUMN_ID_IKTATOSZAM: string;
  readonly VITE_COLUMN_ID_SORSZAM: string;
  readonly VITE_COLUMN_ID_ROGZITVE: string;
  readonly VITE_COLUMN_ID_KELT: string;
  readonly VITE_COLUMN_ID_DOK_TIPUS: string;
  readonly VITE_COLUMN_ID_PARTNER_TIPUS: string;
  readonly VITE_COLUMN_ID_DOK_ALTIPUS: string;
  readonly VITE_COLUMN_ID_FILES: string;
  readonly VITE_COLUMN_ID_FORMATUM: string;
  readonly VITE_COLUMN_ID_IRANY: string;
  readonly VITE_COLUMN_ID_EREDETI_NEV: string;
  readonly VITE_COLUMN_ID_SAJAT_CEG: string;
  readonly VITE_COLUMN_ID_APOLLO_PARTNER: string;
  readonly VITE_COLUMN_ID_POST_CIM: string;
  readonly VITE_COLUMN_ID_EMAIL: string;
  readonly VITE_COLUMN_ID_DOK_NEVE: string;
  readonly VITE_COLUMN_ID_DOK_TARGYA: string;
  readonly VITE_COLUMN_ID_FELADAS_ERKEZES: string;
  readonly VITE_COLUMN_ID_FELADAS_DATUM: string;
  readonly VITE_COLUMN_ID_FELADASI_BIZONYLAT: string;
  readonly VITE_COLUMN_ID_KISZIGNALAS_CIMZETT: string;
  readonly VITE_COLUMN_ID_KISZIGNALAS_DATUM: string;
  readonly VITE_COLUMN_ID_KTG_KATEG: string;
  readonly VITE_COLUMN_ID_APOLLO_UZLETAG: string;
  readonly VITE_COLUMN_ID_APOLLO_PROJEKTNEV: string;
  readonly VITE_COLUMN_ID_APOLLO_MUNKAHELY: string;
  readonly VITE_COLUMN_ID_BORA_VISSZAJOTT: string;
  readonly VITE_COLUMN_ID_IKTATVA: string;
  readonly VITE_COLUMN_ID_MONDAY_PROJEKTSZAM: string;
  readonly VITE_COLUMN_ID_KISZIGNALVA: string;
  
  readonly VITE_APOLLO_PARTNER_COLUMN_ID_CIM1: string;
  readonly VITE_APOLLO_PARTNER_COLUMN_ID_CIM2: string;
  readonly VITE_APOLLO_PARTNER_COLUMN_ID_CIM3: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}