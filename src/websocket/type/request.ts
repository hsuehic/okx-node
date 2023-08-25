import {
  WsInstrumentType,
  WsInstrumentTypeWithAny,
  WsOrderSide,
  WsPublicIndexKlineChannel,
  WsPublicKlineChannel,
  WsPublicMarkPriceKlineChannel,
  WsPublicOrderBooksChannel,
  WsQuickMgnType,
  WsSizeUnit,
  WsStpMode,
  WsSubscribeOp,
  WsSubscriptionTopic,
  WsTradeMode,
  WsTradeOp,
} from './meta.js';

export type WsPingRequest = 'ping';

//#region Subscribe
export interface WsBaseRequest<T> {
  op: WsSubscribeOp;
  args: T[];
}

/** Used to trigger order actions over websockets (e.g. placing & cancelling orders) */
export interface WsTradeBaseRequest<T> {
  op: WsTradeOp;
  id: string;
  args: T[];
}

/**
 *
 * Args to be sent with top level requests
 *
 */
export interface WsPrivateChannelArgTickers extends WsSubscriptionTopic {
  channel: 'tickers';
  instId: string;
}

export interface WsPrivateChannelArgWithCcy extends WsSubscriptionTopic {
  channel: 'account' | 'account-greeks' | 'withdrawal-info';
  ccy?: string;
}

export interface WsPrivateChannelArgWithInstFamily extends WsSubscriptionTopic {
  channel: 'positions' | 'orders' | 'orders-algo' | 'liquidation-warning';
  instType: WsInstrumentTypeWithAny;
  instFamily?: string;
  instId?: string;
}

export interface WsPrivateChannelArgAlgo extends WsSubscriptionTopic {
  channel: 'algo-advance';
  instType: WsInstrumentTypeWithAny;
  instId?: string;
  algoId?: string;
}

export interface WsPrivateChannelArgBalanceAndPosition
  extends WsSubscriptionTopic {
  channel: 'balance_and_position';
}

export interface WsPrivateChannelArgGridOrders extends WsSubscriptionTopic {
  channel: 'grid-orders-spot' | 'grid-orders-contract' | 'grid-orders-moon';
  instType: 'SPOT' | 'ANY';
  instId?: string;
  algoId?: string;
}

export interface WsPrivateChannelArgGridOther extends WsSubscriptionTopic {
  channel: 'grid-positions' | 'grid-sub-orders';
  algoId: string;
}

export interface WsPublicChannelArgInstType extends WsSubscriptionTopic {
  channel: 'instruments';
  instType: WsInstrumentTypeWithAny;
}

export interface WsPublicChannelArgInstId extends WsSubscriptionTopic {
  channel:
    | 'tickers'
    | 'open-interest'
    | WsPublicKlineChannel
    | WsPublicMarkPriceKlineChannel
    | WsPublicIndexKlineChannel
    | 'trades'
    | 'mark-price'
    | 'price-limit'
    | WsPublicOrderBooksChannel
    | 'funding-rate'
    | 'index-tickers';
  instId: string;
}

export type WsPublicChannelArgInstIdOrFamily = {
  channel: 'estimated-price';
  instType: 'OPTION' | 'FUTURES';
} & (
  | {
      instId: string;
    }
  | {
      instFamily: string;
    }
);

export interface WsPublicChannelArgOptionSummary extends WsSubscriptionTopic {
  channel: 'opt-summary';
  instFamily: string;
}

export interface WsPublicChannelArgStatus extends WsSubscriptionTopic {
  channel: 'status';
}

export interface WsPublicChannelArgLiquidationOrders
  extends WsSubscriptionTopic {
  channel: 'liquidation-orders';
  instType: 'SWAP' | 'FUTURES';
}

export type WsChannelSubUnSubRequestArg =
  | WsPrivateChannelArgTickers
  | WsPrivateChannelArgWithCcy
  | WsPrivateChannelArgWithInstFamily
  | WsPrivateChannelArgAlgo
  | WsPrivateChannelArgBalanceAndPosition
  | WsPrivateChannelArgGridOrders
  | WsPrivateChannelArgGridOther
  | WsPublicChannelArgInstType
  | WsPublicChannelArgInstId
  | WsPublicChannelArgInstIdOrFamily
  | WsPublicChannelArgOptionSummary
  | WsPublicChannelArgStatus
  | WsPublicChannelArgLiquidationOrders;

/**
 *
 * Top level requests with args
 *
 */

export interface WsSubRequest<
  T extends WsSubscriptionTopic = WsSubscriptionTopic
> extends WsBaseRequest<T> {
  op: 'subscribe';
}

export interface WsUnsubRequest<
  T extends WsSubscriptionTopic = WsSubscriptionTopic
> extends WsBaseRequest<T> {
  op: 'unsubscribe';
}
//#endregion

//#region Trade
export interface WsTradeRequest<T = unknown> {
  id: string;
  op: WsTradeOp;
  args: T[];
}

export interface WsPlaceOrderParams {
  /**
   * Instrument ID, e.g. BTC-USD-190927-5000-C
   */
  instId: string;
  /**
   * Trade mode
   * Margin mode isolated cross
   * Non-Margin mode cash
   * Trade Mode, when placing an order, you need to specify the trade mode.
   * Non-margined:
- SPOT and OPTION buyer: cash

Single-currency margin account:
- Isolated MARGIN: isolated
- Cross MARGIN: cross
- Cross SPOT: cash
- Cross FUTURES/SWAP/OPTION: cross
- Isolated FUTURES/SWAP/OPTION: isolated

Multi-currency margin account:
- Isolated MARGIN: isolated
- Cross SPOT: cross
- Cross FUTURES/SWAP/OPTION: cross
- Isolated FUTURES/SWAP/OPTION: isolated

Portfolio margin:
- Isolated MARGIN: isolated
- Cross SPOT: cross
- Cross FUTURES/SWAP/OPTION: cross
- Isolated FUTURES/SWAP/OPTION: isolated
   */
  tdMode: WsTradeMode;
  /**
   * Margin currency
   * Only applicable to cross MARGIN orders in Single-currency margin.
   */
  ccy: string;
  /**
   * Client Order ID as assigned by the client
   * A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 32 characters.
   */
  clOrdId: string;
  /**
   * Order tag
   * A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters.
   */
  tag?: string;
  /**
   * Order side, buy sell
   */
  side: WsOrderSide;
  /**
   * Position side
   * The default is net in the net mode
   * It is required in the long/short mode, and can only be long or short.
   * Only applicable to FUTURES/SWAP.
   */
  posSide?: string;
  /**
   * Order type
   * market: market order
   * limit: limit order
   * post_only: Post-only order
   * fok: Fill-or-kill order
   * ioc: Immediate-or-cancel order
   * optimal_limit_ioc: Market order with immediate-or-cancel order
   * mmp：Market Maker Protection (only applicable to Option in Portfolio Margin mode)
   * mmp_and_post_only：Marekt Maker Protection and Post-only order(only applicable to Option in Portfolio Margin mode)
   * Order type. When creating a new order, you must specify the order type. The order type you specify will affect: 1) what order parameters are required, and 2) how the matching system executes your order. The following are valid order types:
limit: Limit order, which requires specified sz and px.
market: Market order. For SPOT and MARGIN, market order will be filled with market price (by swiping opposite order book). For FUTURES and SWAP, market order will be placed to order book with most aggressive price allowed by Price Limit Mechanism. For OPTION, market order is not supported yet.
post_only: Post-only order, which the order can only provide liquidity to the market and be a maker. If the order would have executed on placement, it will be canceled instead.
fok: Fill or kill order. If the order cannot be fully filled, the order will be canceled. The order would not be partially filled.
ioc: Immediate or cancel order. Immediately execute the transaction at the order price, cancel the remaining unfilled quantity of the order, and the order quantity will not be displayed in the order book.
optimal_limit_ioc：Market order with ioc (immediate or cancel). Immediately execute the transaction of this market order, cancel the remaining unfilled quantity of the order, and the order quantity will not be displayed in the order book. Only applicable to FUTURES and SWAP.
   */
  ordType: string;
  /**
   * Quantity to buy or sell.
   */
  sz: string;
  /**
   * Order price
   * Only applicable to limit,post_only,fok,ioc,mmp,mmp_and_post_only order.
   */
  px: string;
  /**
   * Whether the order can only reduce the position size.
   * Valid options: true or false. The default value is false.
   * Only applicable to MARGIN orders, and FUTURES/SWAP orders in net mode
   * Only applicable to Single-currency margin and Multi-currency margin
   */
  reduceOnly?: boolean;
  /**
   * Order quantity unit setting for sz
   * base_ccy: Base currency ,quote_ccy: Quote currency
   * Only applicable to SPOT Market Orders
   * Default is quote_ccy for buy, base_ccy for sell
   */
  tgtCcy?: WsSizeUnit;
  /**
   * Whether to disallow the system from amending the size of the SPOT Market Order.
   * Valid options: true or false. The default value is false.
   * If true, system will not amend and reject the market order if user does not have sufficient funds.
   * Only applicable to SPOT Market Orders
   */
  banAmend?: boolean;
  /**
   * Quick Margin type. Only applicable to Quick Margin Mode of isolated margin
   * manual, auto_borrow, auto_repay
   * The default value is manual
   */
  quickMgnType?: WsQuickMgnType;
  /**
   * Self trade prevention ID. Orders from the same master account with the same ID will be prevented from self trade.
   * Numerical integers defined by user in the range of 1<= x<= 99999999
   */
  stpId?: string;
  /**
   * Self trade prevention mode
   * Default to cancel maker
   * cancel_maker,cancel_taker, cancel_both
   * Cancel both does not support FOK.
   */
  stpMode?: WsStpMode;
  /**
   * Request effective deadline. Unix timestamp format in milliseconds, e.g. 1597026383085
   */
  expTime?: string;
}

export interface WsPlaceOrderRequest
  extends WsTradeRequest<WsPlaceOrderParams> {
  op: 'order' | 'batch-orders';
}

export type WsCancelOrderParameter = {
  instId: string;
} & (
  | {
      ordId: string;
      clOrdId: never;
    }
  | {
      ordId: never;
      clOrdId: string;
    }
);

export interface WsCancelOrderRequest
  extends WsTradeRequest<WsCancelOrderParameter> {
  op: 'cancel-order' | 'batch-cancel-orders';
}

export interface WsAmendOrderParameter {
  instId: string;
  clxOnFail?: boolean;
  ordId?: string;
  clOrdId?: string;
  reqId?: string;
  newSz: string;
  newPx: string;
}

export interface WsAmendOrderRequest
  extends WsTradeRequest<WsAmendOrderParameter> {
  op: 'amend-order' | 'batch-amend-orders';
}

export interface WsMassCancelParameter {
  instType: WsInstrumentType;
  instFamily: string;
}

export interface WsMassCancelRequest
  extends WsTradeRequest<WsMassCancelParameter> {
  op: 'mass-cancel';
}
//#endregion
