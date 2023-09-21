import EventEmitter from 'events';

import { randomUUID } from 'sign-message';

import {
  WsAmendOrderResponse,
  WsCancelOrderParameter,
  WsCancelOrderRequest,
  WsCancelOrderResponse,
  WsInstrumentType,
  WsMassCancelResponse,
  WsOrderSide,
  WsPlaceOrderParams,
  WsPlaceOrderRequest,
  WsPlaceOrderResponse,
  WsPush,
  WsQuickMgnType,
  WsTradeMode,
  WsTradeResponse,
} from './type';

import { OkxWebSocketClient } from '.';

export type WsOrderState =
  | 'canceled'
  | 'live'
  | 'partially_filled'
  | 'filled'
  | 'mmp_canceled';

export interface WsPushOrdersArg {
  channel: 'orders';
  instType: WsInstrumentType;
  instId: string;
  uid: string;
}
export interface WsOrder {
  /**
   * accumulative filled size
   */
  accFillSz: string;
  amendResult: string;
  /**
   * average fill price
   */
  avgPx: string;
  cTime: string;
  category: string;
  ccy: string;
  clOrdId: string;
  /**
   * error code, default '0' withou error
   */
  code: string;
  execType: string;
  /**
   * accumulative fee
   */
  fee: string;
  feeCcy: string;
  fillFee: string;
  fillFeeCcy: string;
  fillNotionalUsd: string;
  /**
   * latest fill price
   */
  fillPx: string;
  /**
   * latest fill size
   */
  fillSz: string;
  fillPnl: string;
  /**
   * latest fill time
   */
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
  /**
   * book price
   */
  px: string;
  /**
   * accumulative rebate
   */
  rebate: string;
  rebateCcy: string;
  reduceOnly: string;
  reqId: string;
  side: WsOrderSide;
  attachAlgoClOrdId: string;
  slOrdPx: string;
  slTriggerPx: string;
  slTriggerPxType: string;
  source: string;
  state: WsOrderState;
  stpId: string;
  stpMode: string;
  sz: string;
  /**
   * tag of the order
   */
  tag: string;
  /**
   * trade mode
   */
  tdMode: WsTradeMode;
  /**
   * sz's `unit` for market price trade type
   */
  tgtCcy: 'base_ccy' | 'quote_ccy';
  tpOrdPx: string;
  tpTriggerPx: string;
  tpTriggerPxType: string;
  /**
   * latest trade id
   */
  tradeId: string;
  /**
   * Margin Type
   */
  quickMgnType: WsQuickMgnType;
  algoClOrdId: string;
  algoId: string;
  amendSource: string;
  cancelSource: string;
  /**
   * time when Order updated
   */
  uTime: string;
}

export type WsPushOrders = WsPush<WsPushOrdersArg, WsOrder>;

export interface Order {
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
  private _okxWsClient: OkxWebSocketClient;

  constructor(okxWsClient: OkxWebSocketClient) {
    super();
    this._okxWsClient = okxWsClient;
    void this._subscribe();
  }
  private async _subscribe() {
    await this._okxWsClient.privateChannelReady('private');

    await this._okxWsClient.privateChannelReady('business');
    this._okxWsClient.on('trade', (push: WsTradeResponse) => {
      // @ts-ignore known event emitter
      this.emit(push.op, push);
    });
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
  public static getUuid(): string {
    const uuid = randomUUID();
    const clOrdId = uuid.replace(/-/g, '').substring(0, 16); // to meet the constrain of length 32 (msgid, clOrdId)
    return clOrdId;
  }
}
