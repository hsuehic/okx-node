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
  | 'ETC';
type Quote = 'USDC' | 'USDT';

type InstId = `${CryptoCurrency}-${Quote}`;

type TraderType = 'price' | 'diff';

type TraderStatus = 'running' | 'stopped' | 'removed';

declare module '@koa/cors' {
  import * as Koa from 'koa';

  declare function cors(
    opts?: any | undefined
  ): (ctx: Koa.Context, next: Koa.Next) => Promise<any>;
  // eslint-disable-next-line import/no-default-export
  export default cors;
}
