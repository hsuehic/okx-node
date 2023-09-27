import { WsSubscriptionTopic } from 'okx-node';

import { OkxPriceTrader } from './PriceTrader';
import { OkxTrader } from './Trader';

export class OkxTraderMaster {
  private _traders: Map<string, OkxTrader>;

  constructor() {
    this._traders = new Map<string, OkxTrader>();
  }

  addTrader(traderConfig: OkxTraderConfigType) {
    const { type } = traderConfig;
    if (type === 'price') {
      const trader = new OkxPriceTrader(traderConfig);
      const { id } = trader;
      this._traders.set(id, trader);
      return id;
    }
    return '';
  }
  removeTrader(key: string): boolean {
    const trader = this._traders.get(key);
    if (trader) {
      trader.stop();
      trader.dispose();
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
