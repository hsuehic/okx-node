import { WsChannel } from './meta.js';

export type PushChannel = `push-${WsChannel}`;

export interface WsPushArg {
  channel: WsChannel;
}
export interface WsPush<
  TArg extends WsPushArg = WsPushArg,
  TData extends object = object
> {
  arg: TArg;
  data: TData;
}

export interface PriceLimit {
  instId: string;
  /**
   * Maximum buy price
   */
  buyLmt: string;
  /**
   * Minimum sell price
   */
  sellLmt: string;
  /**
   * Price update time, Unix timestamp format in milliseconds, e.g. 1597026383085
   */
  ts: string;
}
