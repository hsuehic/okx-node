import { EventEmitter } from 'events';

import { WsInstrumentType, WsPrivateChannelArgTickers, WsPush } from './type';

import { OkxWebSocketClient } from '.';

export interface WsTicker {
  instType: WsInstrumentType;
  instId: string;
  last: string;
  lastSz: string;
  askPx: string;
  askSz: string;
  bidPx: string;
  bidSz: string;
  open24h: string;
  high24h: string;
  low24h: string;
  volCcy24h: string;
  vol24h: string;
  sodUtc0: string;
  sodUtc8: string;
  ts: string;
}

export interface Market {
  emit(event: 'push-tickers', data: WsTicker[]): boolean;
  on(event: 'push-tickers', listener: (data: WsTicker[]) => void): this;
  off(event: 'push-tickers', listener: (data: WsTicker[]) => void): this;
}

export class Market extends EventEmitter {
  private _okxWsClient: OkxWebSocketClient;
  private _tickers = new Map<string, WsTicker>();

  constructor(okxWsClient: OkxWebSocketClient) {
    super();
    this._okxWsClient = okxWsClient;
    this._okxWsClient.on(
      'push-tickers',
      (push: WsPush<WsPrivateChannelArgTickers, WsTicker>) => {
        const { data } = push;
        const { instId } = data[0];
        this._tickers.set(instId, data[0]);
        this.emit('push-tickers', data);
      }
    );
  }

  public subscribe(arg: WsPrivateChannelArgTickers) {
    this._okxWsClient.subscribe(arg);
  }

  public get tickers(): Map<string, WsTicker> {
    return this._tickers;
  }
}
