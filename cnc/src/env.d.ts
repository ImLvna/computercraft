declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ADMIN_PASSWORD: string;
      NODE_PASSWORD: string;
      PORT: string;
    }
  }
}
export {};
