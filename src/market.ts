import { EventEmitter } from 'events';

import { okxWsClient } from './instanse.js';
import { WsPush } from './type/push.js';
import { WsPrivateChannelArgTickers } from './type/request.js';

export interface WsTicker {
  instType: 'SWAP';
  instId: 'LTC-USD-200327';
  last: '9999.99';
  lastSz: '0.1';
  askPx: '9999.99';
  askSz: '11';
  bidPx: '8888.88';
  bidSz: '5';
  open24h: '9000';
  high24h: '10000';
  low24h: '8888.88';
  volCcy24h: '2222';
  vol24h: '2222';
  sodUtc0: '2222';
  sodUtc8: '2222';
  ts: '1597026383085';
}

export interface Market {
  emit(event: 'push-tickers', data: WsTicker): boolean;
  on(event: 'push-tickers', listener: (data: WsTicker) => void): this;
}

export class Market extends EventEmitter {
  private _okxWsClient = okxWsClient;
  private _tickers = new Map<string, WsTicker>();

  constructor() {
    super();
    this._okxWsClient.on(
      'push-tickers',
      (push: WsPush<WsPrivateChannelArgTickers, WsTicker>) => {
        const { data } = push;
        const { instId } = data;
        this._tickers.set(instId, data);
        this.emit('push-tickers', data);
      }
    );
  }

  public subscribe(args: WsPrivateChannelArgTickers[]) {
    this._okxWsClient.subscribe({
      op: 'subscribe',
      args,
    });
  }

  public get tickers(): Map<string, WsTicker> {
    return this._tickers;
  }
}
