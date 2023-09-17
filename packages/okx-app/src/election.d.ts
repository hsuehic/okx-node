import { Shell } from 'electron';
import {
  Account,
  LogSettings,
  Market,
  OkxRestClient,
  OkxWebSocketClient,
  Order,
  // WsOrder,
  WsPublicIndexKlineChannel,
} from 'okx-node';

// import { HighFrequencyConfigs } from './renderer/component/trade/high-frequency';

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
      account: Account;
      market: Market;
      order: Order & {
        getUuid: () => string;
      };
    };
    // persist: {
    //   findOrderBy(where: Partial<WsOrder>): Promise<WsOrder[]>;
    //   saveOrder(order: WsOrder): Promise<void>;
    //   findTraderBy(
    //     where: Partial<HighFrequencyConfigs>
    //   ): Promise<HighFrequencyConfigs[]>;
    //   saveTrader(trader: HighFrequencyConfigs): Promise<void>;
    // };
  }
}
