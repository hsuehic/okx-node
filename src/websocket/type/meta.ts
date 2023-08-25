//#region op
export type WsTradeOp =
  | 'order'
  | 'batch-orders'
  | 'cancel-order'
  | 'batch-cancel-orders'
  | 'amend-order'
  | 'batch-amend-orders'
  | 'mass-cancel';

export type WsSubscribeOp = 'subscribe' | 'unsubscribe';
//#endregion op

//#region channel
export type WsPrivateChannel =
  | 'account'
  | 'positions'
  | 'balance_and_position'
  | 'orders'
  | 'orders-algo'
  | 'algo-advance'
  | 'liquidation-warning'
  | 'account-greeks'
  | 'grid-orders-spot'
  | 'grid-orders-contract'
  | 'grid-orders-moon'
  | 'grid-positions'
  | 'grid-sub-orders';

export type WsPublicKlineChannel =
  | 'candle1Y'
  | 'candle6M'
  | 'candle3M'
  | 'candle1M'
  | 'candle1W'
  | 'candle1D'
  | 'candle2D'
  | 'candle3D'
  | 'candle5D'
  | 'candle12H'
  | 'candle6H'
  | 'candle4H'
  | 'candle2H'
  | 'candle1H'
  | 'candle30m'
  | 'candle15m'
  | 'candle5m'
  | 'candle3m'
  | 'candle1m'
  | 'candle1Yutc'
  | 'candle3Mutc'
  | 'candle1Mutc'
  | 'candle1Wutc'
  | 'candle1Dutc'
  | 'candle2Dutc'
  | 'candle3Dutc'
  | 'candle5Dutc'
  | 'candle12Hutc'
  | 'candle6Hutc';

export type WsPublicMarkPriceKlineChannel =
  | 'mark-price-candle1Y'
  | 'mark-price-candle6M'
  | 'mark-price-candle3M'
  | 'mark-price-candle1M'
  | 'mark-price-candle1W'
  | 'mark-price-candle2D'
  | 'mark-price-candle3D'
  | 'mark-price-candle5D'
  | 'mark-price-candle12H'
  | 'mark-price-candle6H'
  | 'mark-price-candle4H'
  | 'mark-price-candle2H'
  | 'mark-price-candle1H'
  | 'mark-price-candle30m'
  | 'mark-price-candle15m'
  | 'mark-price-candle5m'
  | 'mark-price-candle3m'
  | 'mark-price-candle1m'
  | 'mark-price-candle1Yutc'
  | 'mark-price-candle3Mutc'
  | 'mark-price-candle1Mutc'
  | 'mark-price-candle1Wutc'
  | 'mark-price-candle1Dutc'
  | 'mark-price-candle2Dutc'
  | 'mark-price-candle3Dutc'
  | 'mark-price-candle5Dutc'
  | 'mark-price-candle12Hutc'
  | 'mark-price-candle6Hutc';

export type WsPublicIndexKlineChannel =
  | 'index-candle1Y'
  | 'index-candle6M'
  | 'index-candle3M'
  | 'index-candle1M'
  | 'index-candle1W'
  | 'index-candle1D'
  | 'index-candle2D'
  | 'index-candle3D'
  | 'index-candle5D'
  | 'index-candle12H'
  | 'index-candle6H'
  | 'index-candle4H'
  | 'index-candle2H'
  | 'index-candle1H'
  | 'index-candle30m'
  | 'index-candle15m'
  | 'index-candle5m'
  | 'index-candle3m'
  | 'index-candle1m'
  | 'index-candle1Yutc'
  | 'index-candle3Mutc'
  | 'index-candle1Mutc'
  | 'index-candle1Wutc'
  | 'index-candle1Dutc'
  | 'index-candle2Dutc'
  | 'index-candle3Dutc'
  | 'index-candle5Dutc'
  | 'index-candle12Hutc'
  | 'index-candle6Hutc';

export type WsPublicOrderBooksChannel =
  | 'books'
  | 'books5'
  | 'bbo-tbt'
  | 'books-l2-tbt'
  | 'books50-l2-tpt';

export type WsPublicChannel =
  | 'instruments'
  | 'tickers'
  | 'open-interest'
  | WsPublicKlineChannel
  | WsPublicMarkPriceKlineChannel
  | WsPublicIndexKlineChannel
  | 'trades'
  | 'estimated-price'
  | 'mark-price'
  | 'price-limit'
  | WsPublicOrderBooksChannel
  | 'opt-summary'
  | 'funding-rate'
  | 'index-tickers'
  | 'status'
  | 'liquidation-orders';

export type WsBusinessPrivateChannel =
  | 'orders-algo'
  | 'algo-advance'
  | 'deposit-info'
  | 'withdrawal-info'
  | 'grid-orders-spot'
  | 'grid-orders-contract'
  | 'grid-orders-moon'
  | 'grid-positions'
  | 'grid-sub-orders'
  | 'algo-recurring-buy';

export type WsBusinessPublicChannel =
  | WsPublicKlineChannel
  | WsPublicMarkPriceKlineChannel
  | WsPublicIndexKlineChannel;

export type WsBusinessChannel =
  | WsBusinessPrivateChannel
  | WsBusinessPublicChannel;

export type WsChannel = WsPublicChannel | WsPrivateChannel | WsBusinessChannel;

export interface WsSubscriptionTopic {
  channel: WsChannel;
}

export interface WsPrivateSubscriptionTopic {
  channel: WsPrivateChannel;
}

export interface WsPublicSubscriptionTopic {
  channel: WsPublicChannel;
}
//#endregion channel

//#region Instrument
export type WsInstrumentType =
  | 'SPOT'
  | 'MARGIN'
  | 'SWAP'
  | 'FUTURES'
  | 'OPTION';

export type WsInstrumentTypeWithAny = WsInstrumentType | 'ANY';

export interface WsInstrument {
  /**
   * Instrument type
   */
  instType: WsInstrumentType;
  /**
   * e.g. `BTC-USD-SWAP`
   */
  instId: string;
  /**
   * Underlying
   * e.g. BTC-USD Only applicable to FUTURES/SWAP/OPTION
   */
  uly?: string;
  /**
   * Instrument family, e.g. BTC-USD Only applicable to FUTURES/SWAP/OPTION
   */
  instFamily?: string;
  /**
   * Currency category. Note: this parameter is already deprecated
   */
  category: string;
  /**
   * Base currency, e.g. BTC inBTC-USDT Only applicable to SPOT/MARGIN
   */
  baseCcy?: string;
  /**
   * Quote currency
   * e.g. USDT in BTC-USDT Only applicable to SPOT/MARGIN
   */
  quoteCcy?: string;
  /**
   * Settlement and margin currency
   * e.g. BTC Only applicable to FUTURES/SWAP/OPTION
   */
  settleCcy?: string;
  /**
   * Contract value Only applicable to FUTURES/SWAP/OPTION
   */
  ctVal?: string;
  /**
   * Contract multiplier Only applicable to FUTURES/SWAP/OPTION
   */
  ctMult?: string;
  /**
   * Contract value currency Only applicable to FUTURES/SWAP/OPTION
   */
  ctValCcy?: string;
  /**
   * Option type, C: Call P: put Only applicable to OPTION
   */
  optType?: string;
  /**
   * Strike price Only applicable to OPTION
   */
  stk?: string;
  listTime: string; // Listing time, Unix timestamp format in milliseconds, e.g. 1597026383085
  /**
   * Expiry time
   * Applicable to SPOT/MARGIN/FUTURES/SWAP/OPTION.
   * For FUTURES/OPTION, it is natural delivery/exercise time.
   * It is the instrument offline time when there is SPOT/MARGIN/FUTURES/SWAP/ manual offline.
   * Update once change.
   */
  expTime: string;
  /**
   * Max Leverage, Not applicable to SPOT, OPTION
   */
  lever?: string;
  /**
   * Tick size,
   * e.g. 0.0001 For Option, it is minimum tickSz among tick band,
   * please use "Get option tick bands" if you want get option tickBands.
   */
  tickSz: string;
  /**
   * Lot size, e.g. BTC-USDT-SWAP: 1
   */
  lotSz: string;
  /**
   *  Minimum order size.
   * If it is a derivatives contract, the value is the number of contracts.
   * If it is SPOT/MARGIN, the value is the quantity in base currency.
   */
  minSz: string;
  /**
   * Contract type
   * linear: linear contract
   * inverse: inverse contract
   * Only applicable to FUTURES/SWAP
   */
  ctType?: string;
  /**
   * Alias
   * this_week
   * next_week
   * quarter
   * next_quarter
   * Only applicable to FUTURES
   */
  alias?: string;
  /**
   * Instrument status
   * live
   * suspend
   * preopen. e.g. There will be preopen before the Futures and Options new contracts state is live.
   * test: Test pairs, can't be traded
   */
  state: string;
  /**
   * The maximum order quantity of the contract or spot limit order.
   * If it is a derivatives contract, the value is the number of contracts.
   * If it is SPOT/MARGIN, the value is the quantity in base currency.
   */
  maxLmtSz?: string;
  /**
   * The maximum order quantity of the contract or spot market order.
   * If it is a derivatives contract, the value is the number of contracts.
   * If it is SPOT/MARGIN, the value is the quantity in "USDT".
   */
  maxMktSz?: string;
  /**
   * The maximum order quantity of the contract or spot twap order.
   * If it is a derivatives contract, the value is the number of contracts.
   * If it is SPOT/MARGIN, the value is the quantity in base currency.
   */
  maxTwapSz?: string;
  /**
   * The maximum order quantity of the contract or spot iceBerg order.
   * If it is a derivatives contract, the value is the number of contracts.
   * If it is SPOT/MARGIN, the value is the quantity in base currency.
   */
  maxIcebergSz?: string;
  /**
   * The maximum order quantity of the contract or spot trigger order.
   * If it is a derivatives contract, the value is the number of contracts.
   * If it is SPOT/MARGIN, the value is the quantity in base currency.
   */
  maxTriggerSz?: string;
  /**
   * The maximum order quantity of the contract or spot stop market order.
   * If it is a derivatives contract, the value is the number of contracts.
   * If it is SPOT/MARGIN, the value is the quantity in "USDT".
   */
  maxStopSz?: string;
}

export interface WsDerivativeInstrument extends WsInstrument {
  uly: string; // Underlying, e.g. BTC-USD Only applicable to FUTURES/SWAP/OPTION
  instFamily: string; // Instrument family, e.g. BTC-USD Only applicable to FUTURES/SWAP/OPTION
}
//#endregion Instrument

//#region Trade
export type WsOrderSide = 'buy' | 'sell';
export type WsTradeMode = 'isolated' | 'cross' | 'cash';
export type WsPosSide = 'net' | 'short' | 'long';
export type WsOrdType =
  | 'market'
  | 'limit'
  | 'post_only'
  | 'fok'
  | 'ooc'
  | 'optimal_limit_ioc'
  | 'mmp'
  | 'mmp_and_post_only';

export type WsQuickMgnType = 'manual' | 'auto_borrow' | 'auto_repay';
export type WsStpMode = 'cancel_maker' | 'cancel_taker' | 'cancel_both';
export type WsSizeUnit = 'quote_ccy' | 'base_ccy';
export type WsMgnMode = 'cross' | 'isolated';

//#endregion Trade

//#region Position

export interface WsCloseOrderAlgo {
  algoId: string;
  slTriggerPx: string;
  slTriggerPxType: string;
  tpTriggerPx: string;
  tpTriggerPxType: string;
  closeFraction: string;
}

export interface WsPosition {
  baseBal: string;
  quoteBal: string;
  adl: string;
  availPos: string;
  avgPx: string;
  cTime: string;
  ccy: string;
  deltaBS: string;
  deltaPA: string;
  gammaBS: string;
  gammaPA: string;
  imr: string;
  instId: string;
  instType: WsInstrumentType;
  interest: string;
  idxPx: string;
  last: string;
  usdPx: string;
  lever: string;
  liab: string;
  liabCcy: string;
  liqPx: string;
  markPx: string;
  margin: string;
  mgnMode: WsMgnMode;
  mgnRatio: string;
  mmr: string;
  notionalUsd: string;
  optVal: string;
  pTime: string;
  pos: string;
  baseBorrowed: string;
  baseInterest: string;
  quoteBorrowed: string;
  quoteInterest: string;
  posCcy: string;
  posId: string;
  posSide: string;
  spotInUseAmt: string;
  spotInUseCcy: string;
  bizRefId: string;
  bizRefType: string;
  thetaBS: string;
  thetaPA: string;
  tradeId: string;
  uTime: string;
  upl: string;
  uplLastPx: string;
  uplRatio: string;
  uplRatioLastPx: string;
  vegaBS: string;
  vegaPA: string;
  closeOrderAlgo: WsCloseOrderAlgo[];
}

export interface WsBalanceData {
  ccy: string;
  cashBal: string;
  uTime: string;
}

export type WsPositionData = Pick<
  WsPosition,
  | 'posId'
  | 'tradeId'
  | 'instId'
  | 'instType'
  | 'mgnMode'
  | 'posSide'
  | 'pos'
  | 'ccy'
  | 'posCcy'
  | 'avgPx'
  | 'uTime'
>;
//#endregion Position

//#region Mark Price
export interface WsCandle {
  ts: string;
  o: string;
  h: string;
  l: string;
  c: string;
  vol: string;
  volCcy: string;
  volCcyQuote: string;
  confirm: '0' | '1';
}
export type WsCandleArray = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  '0' | '1'
];
export interface WsIndexTickers {
  instId: string;
  idxPx: string;
  open24H: string;
  high24h: string;
  low24h: string;
  sodUtc0: string;
  sodUtc8: string;
  ts: string;
}

export type WsIndexTickersArray = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string
];
export interface WsMarkPriceCandle {
  ts: string;
  o: string;
  h: string;
  l: string;
  c: string;
  confirm: '0' | '1';
}

export type WsMarkPriceCandleArray = [
  string,
  string,
  string,
  string,
  string,
  '0' | '1'
];
//#endregion
