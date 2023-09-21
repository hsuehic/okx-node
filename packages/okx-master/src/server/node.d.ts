declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    PASSPHRASE: string;
    SECRET_KEY: string;
    MARKET: 'prod' | 'aws' | 'demo';
  }
}
