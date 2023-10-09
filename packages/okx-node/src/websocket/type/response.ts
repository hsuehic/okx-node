import { WsSubscribeOp, WsSubscriptionTopic, WsTradeOp } from './meta.js';

type ResponseEventType = WsSubscribeOp | 'login' | 'error';

export type WsPongResponse = 'pong';

//#region  Subscribe
export interface WsBaseResponse {
  event: ResponseEventType;
}

export interface WsFailureResponse {
  event: 'error';
  code: string;
  msg: string;
}
export interface WsLoginResonse {
  event: 'login';
  code: string;
  msg: string;
}

export interface WsSubscribeResponse<
  T extends WsSubscriptionTopic = WsSubscriptionTopic
> {
  event: WsSubscribeOp;
  args: T[];
}
//#region

//#region  Trade
export interface WsTradeResponse<T = unknown> {
  id: string;
  op: WsTradeOp;
  data: T[];
  code: string;
  msg: string;
}

export interface WsPlaceOrderResponseParameter {
  ordId: string;
  clOrdId: string;
  tag: string;
  /**
   * Order status code, 0 means succes
   */
  sCode: string;
  /**
   * Rejection or success message of event execution.
   */
  sMsg: string;
}

export interface WsPlaceOrderResponse
  extends WsTradeResponse<WsPlaceOrderResponseParameter> {
  op: 'order' | 'batch-orders';
}
export interface WsCancelOrderResponseParameter {
  ordId: string;
  clOrdId: string;
  sCode: string;
  sMsg: string;
}

export interface WsCancelOrderResponse
  extends WsTradeResponse<WsCancelOrderResponseParameter> {
  op: 'cancel-order' | 'batch-cancel-orders';
}

export interface WsMassCancelResponseParameters {
  result: boolean;
}

export interface WsMassCancelResponse
  extends WsTradeResponse<WsMassCancelResponseParameters> {
  op: 'mass-cancel';
}

export interface WsAmendOrderResponseParameter {
  ordId: string;
  clOrdId: string;
  reqId: string;
  sCode: string;
  sMsg: string;
}

export interface WsAmendOrderResponse
  extends WsTradeResponse<WsAmendOrderResponseParameter> {
  op: 'amend-order' | 'batch-amend-orders';
}
//#endregion

export type WsResponse =
  | WsFailureResponse
  | WsLoginResonse
  | WsSubscribeResponse
  | WsTradeResponse;
