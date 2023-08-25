import { randomUUID } from 'crypto';
import EventEmitter from 'events';

import { okxWsClient } from '../instanse';

import {
  WsAmendOrderResponse,
  WsCancelOrderParameter,
  WsCancelOrderRequest,
  WsCancelOrderResponse,
  WsInstrumentType,
  WsMassCancelResponse,
  WsPlaceOrderParams,
  WsPlaceOrderRequest,
  WsPlaceOrderResponse,
  WsPush,
  WsTradeResponse,
} from './type';

export interface WsPushOrdersArg {
  channel: 'orders';
  instType: WsInstrumentType;
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

export type OrderEvent = 'push-orders';

export interface Order {
  emit(event: OrderEvent, data: WsOrder[]): boolean;
  emit(event: 'order' | 'batch-orders', data: WsPlaceOrderResponse): boolean;
  emit(
    event: 'cancel-order' | 'batch-cancel-orders',
    data: WsCancelOrderResponse
  ): boolean;
  emit(
    event: 'amend-order' | 'batch-amend-orders',
    data: WsAmendOrderResponse
  ): boolean;
  emit(event: 'mass-cancel', data: WsMassCancelResponse): boolean;

  on(event: OrderEvent, listener: (push: WsOrder) => void): this;
  on(
    event: 'order' | 'batch-orders',
    listener: (push: WsPlaceOrderResponse) => void
  ): this;
  on(
    event: 'cancel-order' | 'batch-cancel-orders',
    listener: (push: WsCancelOrderResponse) => void
  ): this;
  on(
    event: 'amend-order' | 'batch-amend-orders',
    listener: (push: WsAmendOrderResponse) => void
  ): this;
  on(
    event: 'mass-cancel',
    listener: (push: WsMassCancelResponse) => void
  ): this;
  off(event: OrderEvent, listener: (push: WsOrder) => void): this;
  off(
    event: 'order' | 'batch-orders',
    listener: (push: WsPlaceOrderResponse) => void
  ): this;
  off(
    event: 'cancel-order' | 'batch-cancel-orders',
    listener: (push: WsCancelOrderResponse) => void
  ): this;
  off(
    event: 'amend-order' | 'batch-amend-orders',
    listener: (push: WsAmendOrderResponse) => void
  ): this;
  off(
    event: 'mass-cancel',
    listener: (push: WsMassCancelResponse) => void
  ): this;
}

export class Order extends EventEmitter {
  private _okxWsClient = okxWsClient;

  constructor() {
    super();
    void this._subscribe();
  }
  private async _subscribe() {
    await okxWsClient.privateChannelReady('private');
    this._okxWsClient.subscribe({
      channel: 'orders',
      instType: 'ANY',
    });
    await okxWsClient.privateChannelReady('business');
    this._okxWsClient.subscribe({
      channel: 'orders-algo',
      instType: 'FUTURES',
    });
    this._okxWsClient.on('push-orders', (push: WsPush) => {
      this._handleOrdersPush(push as WsPushOrders);
    });
    this._okxWsClient.on('trade', (push: WsTradeResponse) => {
      // @ts-ignore known event emitter
      this.emit(push.op, push);
    });
  }
  private _handleOrdersPush(push: WsPushOrders) {
    const { data } = push;
    this.emit('push-orders', data);
  }
  public async placeOrder(params: WsPlaceOrderParams[]): Promise<string> {
    const id = Order.getUuid();
    const req: WsPlaceOrderRequest = {
      id: id, // msgId
      op: 'order',
      args: params,
    };
    await this._okxWsClient.privateChannelReady('private');
    this._okxWsClient.trade(req);
    return id;
  }
  public async cancelOrder(params: WsCancelOrderParameter[]): Promise<string> {
    const id = Order.getUuid();
    const req: WsCancelOrderRequest = {
      id,
      op: 'cancel-order',
      args: params,
    };
    await this._okxWsClient.privateChannelReady('private');
    this._okxWsClient.trade(req);
    return id;
  }
  public static getUuid() {
    const uuid = randomUUID({
      disableEntropyCache: false,
    });
    const clOrdId = uuid.replace(/-/g, '').substring(0, 16); // to meet the constrain of length 32 (msgid, clOrdId)
    return clOrdId;
  }
}
