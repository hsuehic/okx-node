import { WsSubscriptionTopic } from 'okx-node';

import { OkxDiffTraderConfig } from './DiffTrader';
import { OkxPriceTrader, OkxPriceTraderConfig } from './PriceTrader';
import { OkxTrader } from './Trader';

export type TraderConfig = OkxPriceTraderConfig | OkxDiffTraderConfig;

export class OkxTraderMaster {
  private _traders: Map<string, OkxTrader>;

  constructor() {
    this._traders = new Map<string, OkxTrader>();
  }

  addTrader(traderConfig: TraderConfig) {
    const { type } = traderConfig;
    if (type === 'price') {
      const trader = new OkxPriceTrader(traderConfig);
      this._traders.set(trader.id, trader);
    }
    return '';
  }
  removeTrader(key: string): boolean {
    const trader = this._traders.get(key);
    if (trader) {
      trader.stop();
    }
    return this._traders.delete(key);
  }

  getById(key: string) {
    return this._traders.get(key);
  }

  getTradersByInstId(instId: InstId): OkxTrader[] {
    const traders = [...this._traders.values()];
    return traders.filter(trader => trader.instId === instId);
  }

  get traders(): OkxTrader[] {
    return [...this._traders.values()];
  }

  get subscriptions(): WsSubscriptionTopic[] {
    const subscriptions: WsSubscriptionTopic[] = [];
    this._traders.forEach(trader => {
      subscriptions.splice(subscriptions.length, 0, ...trader.subscriptions);
    });
    return subscriptions;
  }
}
