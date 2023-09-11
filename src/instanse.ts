import { config } from 'dotenv';

// import { WsPublicChannelArgInstId } from './type/request';
import { OkxRestClient } from './rest';
import { OkxWebSocketClient } from './websocket/ws-client';

config();
const { API_KEY, PASSPHRASE, SECRET_KEY, MARKET } = process.env;

export const okxWsClient = OkxWebSocketClient.getInstance({
  apiKey: API_KEY,
  passphrase: PASSPHRASE,
  secretKey: SECRET_KEY,
  market: MARKET,
});

// const channel = 'index-candle15m';
// const eventName = `push-${channel}` as const;
// const args: WsPublicChannelArgInstId[] = [
//   {
//     channel,
//     instId: 'BTC-USDT',
//   },
// ];
// okxWsClient.subscribe({
//   op: 'subscribe',
//   args,
// });
// okxWsClient.on(eventName, data => console.log(data));

export const okxRestClient = new OkxRestClient(
  {
    apiKey: API_KEY,
    apiPass: PASSPHRASE,
    apiSecret: SECRET_KEY,
  },
  MARKET
);
// void okxRestClient.getPositions().then(data => console.log(data));
// void okxRestClient
//   .getIndexTickers({ instId: 'BTC-USDT' })
//   .then(data => console.log(data));

// void okxRestClient.getIndexCandles('BTC-USDT').then(data => console.log(data));

// void okxRestClient
//   .setIsolatedMode('quick_margin', 'MARGIN')
//   .then(res => {
//     console.log(res);
//   })
//   .catch(ex => console.error(ex));
