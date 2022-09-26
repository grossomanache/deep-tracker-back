declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      APP_SECRET: string;
      PORT: number;
    }
  }
}

export {};
