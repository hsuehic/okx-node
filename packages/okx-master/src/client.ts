import { okxWsClient } from 'okx-node';

okxWsClient.verbose = {
  pong: true,
};

okxWsClient.on('push-account', data => {
  console.log(data);
});

okxWsClient.on('push-orders', data => {
  console.log(data);
});
