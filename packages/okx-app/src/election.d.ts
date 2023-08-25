import { Shell } from 'electron';
import {
  Account,
  LogSettings,
  Market,
  OkxRestClient,
  OkxWebSocketClient,
  Order,
  WsPublicIndexKlineChannel,
} from 'okx-node';

declare global {
  type ExtractStringType<
    T extends string,
    B extends string,
    A extends string
  > = T extends `${B}${infer R}${A}` ? R : never;

  type Bar = ExtractStringType<WsPublicIndexKlineChannel, 'index-candle', ''>;
  interface Window {
    shell: ExposableObject<Shell>;
    restClient: ExposableType<OkxRestClient>;
    wsClient: ExposableType<OkxWebSocketClient> & {
      updateVoberseSettings(settings: LogSettings): void;
      account: ExposableType<Account>;
      market: ExposableType<Market>;
      order: ExposableType<Order> & {
        getUuid: () => string;
      };
    };
  }
}
