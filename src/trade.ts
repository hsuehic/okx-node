import EventEmitter from 'events';

import { okxWsClient } from './instanse.js';
import { InstrumentType } from './type/meta.js';
import { WsPush } from './type/push.js';
import { WsPlaceOrderParams, WsPlaceOrderRequest } from './type/request.js';

export interface WsPushOrdersArg {
  channel: 'orders';
  instType: InstrumentType;
  instId: string;
  uid: string;
}
export interface WsOrder {
  accFillSz: string;
  amendResult: string;
  avgPx: string;
  cTime: string;
  category: string;
  ccy: string;
  clOrdId: string;
  code: string;
  execType: string;
  fee: string;
  feeCcy: string;
  fillFee: string;
  fillFeeCcy: string;
  fillNotionalUsd: string;
  fillPx: string;
  fillSz: string;
  fillPnl: string;
  fillTime: string;
  instId: string;
  instType: string;
  lever: string;
  msg: string;
  notionalUsd: string;
  ordId: string;
  ordType: string;
  pnl: string;
  posSide: string;
  px: string;
  rebate: string;
  rebateCcy: string;
  reduceOnly: string;
  reqId: string;
  side: string;
  attachAlgoClOrdId: string;
  slOrdPx: string;
  slTriggerPx: string;
  slTriggerPxType: string;
  source: string;
  state: string;
  stpId: string;
  stpMode: string;
  sz: string;
  tag: string;
  tdMode: string;
  tgtCcy: string;
  tpOrdPx: string;
  tpTriggerPx: string;
  tpTriggerPxType: string;
  tradeId: string;
  quickMgnType: string;
  algoClOrdId: string;
  algoId: string;
  amendSource: string;
  cancelSource: string;
  uTime: string;
}

export type WsPushOrders = WsPush<WsPushOrdersArg, WsOrder>;

export interface Trade {
  emit(event: 'push-orders', data: WsOrder): boolean;
  on(event: 'push-orders', listener: (push: WsOrder) => void): this;
}

export class Trade extends EventEmitter {
  private _okxWsClient = okxWsClient;
  private _pendingOrders: Record<string, WsPlaceOrderParams[]>;
  constructor() {
    super();
    this._subscribe();
  }
  private _subscribe() {
    this._okxWsClient.subscribe({
      op: 'subscribe',
      args: [
        {
          channel: 'orders',
          instType: 'ANY',
        },
      ],
    });
    this._okxWsClient.on('push-orders', (push: WsPush) => {
      this._handleOrdersPush(push as WsPushOrders);
    });
  }
  private _handleOrdersPush(push: WsPushOrders) {
    const { arg, data } = push;
    console.log(arg);
    this.emit('push-orders', data);
  }
  public placeOder(params: WsPlaceOrderParams[]): void {
    const req: WsPlaceOrderRequest = {
      id: '',
      op: 'order',
      args: params,
    };
    this._okxWsClient.trade(req);
  }
}
