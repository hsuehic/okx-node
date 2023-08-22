/* eslint-disable */
import { OkxWebSocketClient } from '../../../dist/cjs/client';
window.onload = () => {
  // @ts-ignore
  console.log(window.okxWsClient);

  // @ts-ignore
  const client = window.okxWsClient as OkxWebSocketClient;

  const element = document.getElementById('ts');
  client.on('push', data => {
    // @ts-ignore
    if (element) element.innerHTML = data.data.data[0].ts;
  });

  console.log('xx');
}
