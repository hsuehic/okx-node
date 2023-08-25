/* eslint-disable @typescript-eslint/ban-ts-comment */
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, shell } from 'electron';
import {
  Account,
  LogSettings,
  Market,
  OkxRestClient,
  OkxWebSocketClient,
  Order,
  okxRestClient,
  okxWsClient,
} from 'okx-node';

const getExposableObject = <T extends object>(origin: T): ExposableType<T> => {
  const exposableObject = {} as ExposableType<T>;
  for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(origin))) {
    console.log(key);
    if (key !== 'constructor') {
      const k = key as ExposablePropName<T>;
      const fun = origin[k];
      exposableObject[k] = ((...args: unknown[]) => {
        if (typeof fun === 'function') {
          // eslint-disable-next-line
          return fun.bind(origin)(...args);
        } else {
          // eslint-disable-next-line
          return origin[k];
        }
      }) as ExposableType<T>[typeof k];
    }
  }
  return exposableObject;
};

window.addEventListener('DOMContentLoaded', () => {
  const account = new Account();
  const market = new Market();
  const order = new Order();

  contextBridge.exposeInMainWorld('shell', {
    openExternal(url: string, opts?: Electron.OpenExternalOptions) {
      return shell.openExternal(url, opts);
    },
  });

  contextBridge.exposeInMainWorld(
    'restClient',
    getExposableObject<OkxRestClient>(okxRestClient)
  );

  contextBridge.exposeInMainWorld('wsClient', {
    updateVoberseSettings(settings: LogSettings) {
      okxWsClient.verbose = settings;
    },
    on: okxWsClient.on.bind(okxWsClient) as OkxWebSocketClient['on'],
    off: okxWsClient.on.bind(okxWsClient) as OkxWebSocketClient['off'],
    subscribe: okxWsClient.subscribe.bind(
      okxWsClient
    ) as OkxWebSocketClient['subscribe'],
    unsubscribe: okxWsClient.unsubscribe.bind(
      okxWsClient
    ) as OkxWebSocketClient['unsubscribe'],
    account: {
      on: account.on.bind(account) as Account['on'],
      off: account.off.bind(account) as Account['off'],
      position() {
        return account.position;
      },
      accountInfo() {
        return account.accountInfo;
      },
    },
    market: {
      on: market.on.bind(market) as Market['on'],
      off: market.off.bind(market) as Market['off'],
      subscribe: market.subscribe.bind(market) as Market['subscribe'],
    },
    order: {
      off: order.off.bind(order) as Order['on'],
      on: order.on.bind(order) as Order['off'],
      placeOrder: order.placeOrder.bind(order) as Order['placeOrder'],
      cancelOrder: order.cancelOrder.bind(order) as Order['cancelOrder'],
      getUuid(): string {
        return Order.getUuid();
      },
    },
  });
});
