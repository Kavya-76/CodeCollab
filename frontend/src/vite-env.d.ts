interface ImportMetaEnv {
    readonly VITE_XRapidAPIKey: string;
    readonly VITE_BACKEND_URL:string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  