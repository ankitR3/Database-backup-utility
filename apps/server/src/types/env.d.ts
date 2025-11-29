declare namespace NodeJS {
  interface ProcessEnv {
    DB_URI: string;
    DB_NAME: string;
    PORT?: string;
    // add others as needed
  }
}
