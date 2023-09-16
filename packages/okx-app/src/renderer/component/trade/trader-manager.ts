import { HighFrequency, HighFrequencyConfigs } from './high-frequency';

export interface TraderEventDetail {
  name: string;
  trader: HighFrequency;
}

export type TraderEventName = 'traderadded' | 'traderremoved';

export type TraderEventInit = CustomEventInit<TraderEventDetail>;

export class TraderEvent extends CustomEvent<TraderEventDetail> {
  constructor(name: TraderEventName, init: TraderEventInit) {
    super(name, init);
  }
}

export interface TraderManager {
  dispatchEvent(evnt: TraderEvent): boolean;
  addEventListener(
    eventName: TraderEventName,
    listener: (e: TraderEvent) => void
  ): boolean;
  removeEventListen(
    eventName: TraderEventName,
    listener: (e: TraderEvent) => void
  ): boolean;
}

export class TraderManager extends EventTarget {
  private _traders: Map<string, HighFrequency>;
  constructor() {
    super();
    this._traders = new Map<string, HighFrequency>();
  }

  addTrader(name: string, configs: HighFrequencyConfigs) {
    const trader = new HighFrequency(configs);
    this._traders.set(name, trader);
    this.dispatchEvent(
      new TraderEvent('traderadded', {
        detail: {
          name: name,
          trader,
        },
      })
    );
    return trader;
  }

  removeTrader(name: string): boolean {
    const trader = this._traders.get(name);
    if (trader) {
      this.stopTrader(name);
      this._traders.delete(name);
      this.dispatchEvent(
        new TraderEvent('traderremoved', {
          detail: {
            name: name,
            trader,
          },
        })
      );
      return true;
    }
    return false;
  }

  startTrader(name: string): boolean {
    const trader = this._traders.get(name);
    if (trader) {
      trader.start();
      return true;
    }
    return false;
  }

  stopTrader(name: string): boolean {
    const trader = this._traders.get(name);
    if (trader) {
      trader.stop();
      return true;
    }
    return false;
  }

  getTraders(instId?: InstId): [string, HighFrequency][] {
    const traders: [string, HighFrequency][] = [];
    if (instId) {
      this._traders.forEach((trader: HighFrequency, name: string) => {
        if (instId) {
          if (trader.instId === instId) {
            traders.push([name, trader]);
          }
        } else {
          traders.push([name, trader]);
        }
      });
    }
    return traders;
  }
}

export const traderManager = new TraderManager();
