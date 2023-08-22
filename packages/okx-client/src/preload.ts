/* eslint-disable @typescript-eslint/no-unsafe-argument */
// preload.js

// All the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

import { contextBridge } from 'electron';
import { okxWsClient } from 'okx-node';

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector: string, text: string) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ['chrome', 'node', 'electron'] as const) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
  okxWsClient.send('public', {
    op: 'subscribe',
    args: [
      {
        channel: 'tickers',
        instId: 'LTC-USDC',
      },
    ],
  });
  const priceElement = document.getElementById('price');
  const updatePrice = (price: string) => {
    if (priceElement) priceElement.innerText = price;
  };
  okxWsClient.on('push', data => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    updatePrice(data.data.data[0].last);
    console.log(data);
  });

  contextBridge.exposeInMainWorld('okxWsClient', {
    on: (...args) => {
      okxWsClient.on(...args);
    },
  });
  console.log('xx');
});
