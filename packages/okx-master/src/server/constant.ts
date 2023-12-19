export const isProd = process.env.NODE_ENV !== 'development';

export const host = isProd
  ? 'https://trader.ihsueh.com'
  : 'http://localhost:8080';
