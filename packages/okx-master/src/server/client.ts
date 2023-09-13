import { okxWsClient } from 'okx-node';

okxWsClient.verbose = {
  pong: true,
};

okxWsClient
  .privateChannelReady('private')
  .then(() => {
    okxWsClient.subscribe({
      channel: 'account',
    });
  })
  .catch(ex => {
    console.error(ex);
  });
