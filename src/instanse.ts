import { config } from 'dotenv';

import { OkxWebSocketClient } from './client';

config();
const { API_KEY, PASSPHRASE, SECRET_KEY } = process.env;

export const okxWsClient = OkxWebSocketClient.getInstance({
  apiKey: API_KEY,
  passphrase: PASSPHRASE,
  secretKey: SECRET_KEY,
});
