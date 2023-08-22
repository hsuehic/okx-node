import { okxWsClient } from './instanse';

okxWsClient
  .privateChannelReady()
  .then(() => {
    okxWsClient.send('private', {
      op: 'subscribe',
      args: [
        {
          channel: 'balance_and_position',
        },
      ],
    });
  })
  .catch(ex => {
    console.error(ex);
  });
