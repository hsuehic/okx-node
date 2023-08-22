import { okxWsClient } from './instanse';

// okxWsClient.send('public', {
//   op: 'subscribe',
//   args: [
//     {
//       channel: 'instruments',
//       instType: 'MARGIN',
//     },
//   ],
// });

// okxWsClient.send('public', {
//   op: 'subscribe',
//   args: [
//     {
//       channel: 'mark-price',
//       instId: 'BTC-USDC',
//     },
//   ],
// });

okxWsClient.send('public', {
  op: 'subscribe',
  args: [
    {
      channel: 'tickers',
      instId: 'LTC-USDC',
    },
  ],
});
