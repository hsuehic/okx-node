// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Vite
// plugin that tells the Electron app where to look for the Vite-bundled app code (depending on
// whether you're running in development or production).

declare module '*.module.scss' {
  import {
    Account,
    Market,
    OkxRestClient,
    OkxWebSocketClient,
    Order,
    WsPublicIndexKlineChannel,
  } from 'okx-node';

  const classes: { readonly [key: string]: string };
  // eslint-disable-next-line import/no-default-export
  export default classes;

  declare global {
    type ExtractStringType<
      T extends string,
      B extends string,
      A extends string
    > = T extends `${B}${infer R}${A}` ? R : never;

    type Bar = ExtractStringType<WsPublicIndexKlineChannel, 'index-candle', ''>;

    interface Window {
      restClient: OkxRestClient;
      wsClient: OkxWebSocketClient;
      wsAccount: Account;
      wsMarket: Market;
      wsOrder: Order;
    }
  }
}

declare module '@koa/cors' {
  import * as Koa from 'koa';

  declare function cors(
    opts?: any | undefined
  ): (ctx: Koa.Context, next: Koa.Next) => Promise<any>;
  // eslint-disable-next-line import/no-default-export
  export default cors;
}

type ExposableObject<T extends object> = Omit<T, 'constructor'>;
type ExposablePropName<T extends object> = keyof ExposableObject<T>;

type ExposableType<T extends object> = {
  [P in keyof T]: T[P] extends (...args) => any ? T[P] : () => T[P];
};

type CryptoCurrency =
  | 'BTC'
  | 'ETH'
  | 'LTC'
  | 'XRP'
  | 'SOL'
  | 'BCH'
  | 'DOGE'
  | 'FIL'
  | 'ADA'
  | 'ETC'
  | 'LINK'
  | 'FIL'
  | 'DOT'
  | 'XMR'
  | 'TON'
  | 'UNI'
  | 'WLD'
  | 'OP'
  | 'TIA';
type Quote = 'USDC' | 'USDT';

type InstIdMargin = `${CryptoCurrency}-${Quote}`;

type InstIdSwap = `${InstIdMargin}-SWAP`;

type InstId = InstIdMargin | InstIdSwap;

type TraderType = 'price' | 'swap' | 'tiered';

type TraderStatus = 'running' | 'stopped' | 'removed';

type OrderSide = 'buy' | 'sell' | 'any';

interface OkxTraderConfig {
  name: string;
  type: TraderType;
  instId: InstId | InstIdSwap;
}

interface OkxPriceTraderConfig extends OkxTraderConfig {
  type: 'price';
  basePx: number;
  baseSz: number;
  gap: number;
  levelCount: number;
  coefficient: number;
  name: string;
  initialOrder?: OrderSide;
}

interface OkxTieredTraderConfig extends OkxTraderConfig {
  type: 'tiered';
  basePx: number;
  baseSz: number;
  gap: number;
  levelCount: number;
  coefficient: number;
  maxSize: number;
  minSize: number;
  name: string;
}

interface OkxSwapTraderConfig extends OkxTraderConfig {
  type: 'swap';
  basePx: number;
  baseSz: number;
  gap: number;
  levelCount: number;
  coefficient: number;
  maxSize: number;
  minSize: number;
  name: string;
  posSide: 'long' | 'short';
}

type OkxTraderConfigType =
  | OkxPriceTraderConfig
  | OkxTieredTraderConfig
  | OkxSwapTraderConfig;
