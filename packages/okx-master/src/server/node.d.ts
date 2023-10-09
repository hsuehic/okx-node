declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    PASSPHRASE: string;
    SECRET_KEY: string;
    MARKET: 'prod' | 'aws' | 'demo';
    NODE_ENV: 'development' | 'prod';
    GOOGLE_OAUTH_CLIENT_ID: string;
    GOOGLE_OAUTH_CLIENT_SECRET: string;
    OAUTH_GITHUB_CLIENT_ID: string;
    OAUTH_GITHUB_CLIENT_SECRET: string;
  }
}
