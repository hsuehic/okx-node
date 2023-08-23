/* eslint-disable */
import { OkxWebSocketClient } from 'okx-node';
window.onload = () => {
  // @ts-ignore
  console.log(window.okxWsClient);

  // @ts-ignore
  const client = window.okxWsClient as OkxWebSocketClient;

  const element = document.getElementById('ts');
  // @ts-ignore
  client.on('push', data => {
    // @ts-ignore
    if (element) element.innerHTML = data.data.data[0].ts;
  });

  console.log('xx');
}
