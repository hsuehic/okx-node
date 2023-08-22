import { okxWsClient } from './instanse';

okxWsClient
  .privateChannelReady()
  .then(() => {
    okxWsClient.send('private', {
      op: 'subscribe',
      args: [
        {
          channel: 'orders',
          instType: 'MARGIN',
        },
      ],
    });
  })
  .catch(ex => {
    console.error(ex);
  });
