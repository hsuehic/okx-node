import EventEmitter from 'events';

import { WsSubscriptionTopic } from 'okx-node';

import { OkxPriceTrader } from './PriceTrader';
import { OkxTieredTrader } from './TieredTrader';
import { OkxTrader } from './Trader';

type TraderMasterEvent = 'add' | 'stop' | 'remove' | 'start';
export interface OkxTraderMaster {
  emit(event: TraderMasterEvent, trader: OkxTrader): boolean;
  on(event: TraderMasterEvent, handler: (trader: OkxTrader) => void): this;
}

export class OkxTraderMaster extends EventEmitter {
  private _traders: Map<string, OkxTrader>;

  constructor() {
    super();
    this._traders = new Map<string, OkxTrader>();
  }

  addTrader(traderConfig: OkxTraderConfigType) {
    const { type } = traderConfig;
    let trader: OkxTrader | undefined = undefined;
    switch (type) {
      case 'price':
        trader = new OkxPriceTrader(traderConfig);
        break;
      case 'tiered':
        trader = new OkxTieredTrader(traderConfig);
        break;
      default:
        break;
    }
    if (trader) {
      const { id } = trader;
      this._traders.set(id, trader);
      this.emit('add', trader);
      return id;
    }
    return '';
  }
  removeTrader(id: string): boolean {
    const trader = this._traders.get(id);
    if (trader) {
      trader.stop();
      trader.dispose();
      this.emit('remove', trader);
    }
    const result = this._traders.delete(id);
    return result;
  }

  startTrader(id: string) {
    const trader = this._traders.get(id);
    if (trader) {
      trader.start();
      this.emit('start', trader);
    }
  }

  stopTrader(id: string) {
    const trader = this._traders.get(id);
    if (trader) {
      trader.stop();
      this.emit('stop', trader);
    }
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
