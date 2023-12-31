import { Order, WsOrder, WsPlaceOrderParams } from 'okx-node';

import { BaseTrader } from './BaseTrader';

export class OkxTieredTrader extends BaseTrader {
  protected _config: OkxTieredTraderConfig;
  private _px: number;
  private _maxPx: number;
  private _minPx: number;
  private _baseSz: number;
  private _gap: number;
  private _factor = 1000;
  private _maxSize: number;
  private _minSize: number;

  /**
   * Construct and start high frequency trade
   * @param configs Configurations of trading
   */
  constructor(config: OkxTieredTraderConfig) {
    super(config);
    const { instId, basePx, baseSz, gap, levelCount, maxSize, minSize } =
      config;
    this._id = Order.getUuid();
    this._config = config;
    this._instId = instId;
    this._px = basePx * this._factor;
    this._gap = gap * this._factor;
    this._minPx = this._px - this._gap * levelCount;
    this._maxPx = this._px + this._gap * levelCount;
    this._maxSize = maxSize;
    this._minSize = minSize;
    this._baseSz = baseSz;

    this.start();
  }

  protected _handlePushFilledOrder(order: WsOrder) {
    super._handlePushFilledOrder(order);
    const { clOrdId } = order;
    let newPrice: number | undefined = undefined;
    if (clOrdId === this._buyOrder.clOrdId) {
      newPrice = this._px - this._gap;
    } else if (clOrdId === this._sellOrder.clOrdId) {
      newPrice = this._px + this._gap;
    }
    if (newPrice) {
      this._px = newPrice;
      void this._initializeBooks();
    }
  }

  private _validatePrice(px: number) {
    return px >= this._minPx && px <= this._maxPx;
  }

  private _validateSize(tradeSize: number) {
    const newSize = this._tradedSize + tradeSize;
    return tradeSize < 0 ? newSize >= this._minSize : newSize <= this._maxSize;
  }

  private async _initializeBooks() {
    const {
      _orderClient: orderClient,
      _baseSz: baseSz,
      _gap: gap,
      _px: px,
      _factor: factor,
    } = this;
    if (this._validateSize(baseSz)) {
      const buyPx = px - gap;
      if (this._validatePrice(buyPx)) {
        const buyOrderId = Order.getUuid();
        this._buyOrder = {
          clOrdId: buyOrderId,
        };
        const buyOrderParams: WsPlaceOrderParams =
          this._constructPlaceOrderParams(
            buyOrderId,
            'buy',
            baseSz,
            buyPx / factor
          );
        await orderClient.placeOrder([buyOrderParams]);
      }
    }

    if (this._validateSize(0 - baseSz)) {
      const sellPx = px + gap;
      if (this._validatePrice(sellPx)) {
        const sellOrdId = Order.getUuid();
        this._sellOrder = {
          clOrdId: sellOrdId,
        };
        const sellOrderParams: WsPlaceOrderParams =
          this._constructPlaceOrderParams(
            sellOrdId,
            'sell',
            baseSz,
            sellPx / factor
          );
        await orderClient.placeOrder([sellOrderParams]);
      }
    }
  }

  public dispose() {
    super.dispose();
    this._okxWsClient.off('push-orders', this._handlePushOrders);
  }

  public start() {
    super.start();
    void this._initializeBooks();
  }

  get config(): OkxTieredTraderConfig {
    return this._config;
  }
}
