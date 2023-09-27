import { config } from 'dotenv';
import { OkxRestClient, OkxWebSocketClient } from 'okx-node';

config();

const { API_KEY, SECRET_KEY, PASSPHRASE, MARKET } = process.env;

export const okxRestClient = new OkxRestClient(
  {
    apiKey: API_KEY,
    apiSecret: SECRET_KEY,
    apiPass: PASSPHRASE,
  },
  MARKET
);

export const okxWsClient = OkxWebSocketClient.getInstance({
  apiKey: API_KEY,
  secretKey: SECRET_KEY,
  passphrase: PASSPHRASE,
  market: MARKET,
});

void okxWsClient.privateChannelReady('private').then(() => {
  okxWsClient.subscribe({
    channel: 'orders',
    instType: 'MARGIN',
  });
});
