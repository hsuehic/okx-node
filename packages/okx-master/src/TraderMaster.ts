import { WsSubscriptionTopic } from 'okx-node';

import { IOkxTrader } from './Trader';

export class OkxTraderMaster {
  private _traders: IOkxTrader[];

  constructor() {
    this._traders = [];
  }

  addTrader(trader: IOkxTrader) {
    this._traders.push(trader);
  }
  removeTrader(trader: IOkxTrader) {
    for (const t of this._traders) {
      if (t === trader) {
        const index = this._traders.indexOf(t);
        this._traders.splice(index, 1);
      }
    }
  }

  getTradersByInstId(instId: InstId): IOkxTrader[] {
    return this._traders.filter((trader: IOkxTrader) => {
      return trader.instId === instId;
    });
  }

  get traders(): IOkxTrader[] {
    return this._traders;
  }

  get subscriptions(): WsSubscriptionTopic[] {
    const subscriptions: WsSubscriptionTopic[] = [];
    return subscriptions;
  }
}
