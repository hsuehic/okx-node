import { config } from 'dotenv';

import { OkxWebSocketClient } from './ws-client.js';

config();
const { API_KEY, PASSPHRASE, SECRET_KEY, MARKET } = process.env;

export const okxWsClient = OkxWebSocketClient.getInstance({
  apiKey: API_KEY,
  passphrase: PASSPHRASE,
  secretKey: SECRET_KEY,
  market: MARKET,
});
