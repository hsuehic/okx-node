import {
  OkxWebSocketClient,
  Order,
  WsCancelOrderResponse,
  WsOrder,
  WsOrderSide,
  WsPlaceOrderParams,
  WsPlaceOrderResponse,
  WsPush,
  WsPushOrders,
  WsSubscriptionTopic,
  okxWsClient,
} from 'okx-node';

import { OkxTrader, OkxTraderConfig } from './Trader';

export interface OkxPriceTraderConfig extends OkxTraderConfig {
  type: 'price';
  instId: InstId;
  basePx: number;
  baseSz: number;
  gap: number;
  levelCount: number;
  coefficient: number;
}

/**
 * High Frequency Trader based on bid prices, ask prices, and order status
 * in order to make it work need to subscribe the needed channels(get by instance.channels);
 * Two books will co-exist at the same time that when one book is filled, the other one will be cancelled, two new orders will books will be sent using new prices.
 * e.g. the base price is `0.50`. and gap is `0.005`. 2 books will be initialized when starting, the sell book is at price `0.505`, the buy book will be at price `0.495`.
 * if the buy book is filled, the new books will be buy book at 0.49 and sell book at 0.50. the size of the books will be determined by `coefficient`, using formula `size = Math.pow(coeffient, Math.abs(orderPx - basePx)/gap) * baseSz`;
 */
export class OkxPriceTrader extends EventTarget implements OkxTrader {
  private _id: string;
  private _config: OkxPriceTraderConfig;
  private _instId: InstId;
  private _px: number;
  private _ccy: CryptoCurrency;
  private _basePx: number;
  private _baseSz: number;
  private _gap: number;
  private _factor = 1000;
  private _coefficient: number;
  private _levelCount: number;
  private _quote: Quote;
  private _orderClient: Order;
  private _okxWsClient: OkxWebSocketClient;
  private _buyOrder: {
    clOrdId: string;
    order?: WsOrder;
  };
  private _sellOrder: {
    clOrdId: string;
    order?: WsOrder;
  };
  private _started = false;
  private _filledOrders: WsOrder[] = [];

  /**
   * Construct and start high frequency trade
   * @param instId {InstId}
   * @param configs Configurations of trading
   * @param onOrders Handler of order changes
   */
  constructor(config: OkxPriceTraderConfig) {
    super();
    const { instId, basePx, baseSz, coefficient, gap, levelCount } = config;
    this._id = Order.getUuid();
    this._config = config;
    this._instId = instId;
    const [ccy, quote] = instId.split('-');
    this._ccy = ccy as CryptoCurrency;
    this._quote = quote as Quote;
    this._px = basePx * this._factor;
    this._basePx = this._px;
    this._baseSz = baseSz;
    this._coefficient = coefficient;
    this._gap = gap * this._factor;
    this._levelCount = levelCount;
    this._okxWsClient = okxWsClient;
    this._orderClient = new Order();
    this._buyOrder = {
      clOrdId: '',
    };
    this._sellOrder = {
      clOrdId: '',
    };
    this.start();
  }

  /**
   * subscribe events
   */
  private _on() {
    const { _orderClient: orderClient, _okxWsClient: wsClient } = this;
    orderClient.on('order', this._handlePlaceOrderResponse);
    orderClient.on('cancel-order', this._handleCancelOrderResponse);
    wsClient.on('push-orders', this._handlePushOrders);
  }
  /**
   * unsubscribe events
   */
  private _off() {
    const { _orderClient: orderClient, _okxWsClient: wsClient } = this;
    orderClient.off('order', this._handlePlaceOrderResponse);
    orderClient.off('cancel-order', this._handleCancelOrderResponse);
    wsClient.off('push-orders', this._handlePushOrders);
  }

  /**
   * Handle place order response, currently, do nothing. TODO: Need to re-try or send notification/alert when failed
   * @param res
   */
  private _handlePlaceOrderResponse = (res: WsPlaceOrderResponse) => {
    const { clOrdId } = res.data[0];
    if (res.code === '0') {
      if (this._buyOrder && clOrdId === this._buyOrder.clOrdId) {
        console.log('Buy order was placed');
      } else if (this._sellOrder && clOrdId === this._sellOrder.clOrdId) {
        console.log('Sell order was placed');
      }
    }
  };

  /**
   * Handle cancel order response, currently, do nothing. TODO: Need to re-try or send notification/alert when failed
   * @param res
   */
  private _handleCancelOrderResponse = (res: WsCancelOrderResponse) => {
    const { clOrdId } = res.data[0];
    if (res.code === '0') {
      if (this._buyOrder && clOrdId === this._buyOrder.clOrdId) {
        this._buyOrder.order = undefined;
      } else if (this._sellOrder && clOrdId === this._sellOrder.clOrdId) {
        this._sellOrder.order = undefined;
      }
    }
  };

  private _handlePushOrders = (push: WsPush) => {
    const { data } = push as WsPushOrders;
    const order = data[0];
    switch (order.state) {
      case 'live':
        this._handlePushLiveOrders(order);
        break;
      case 'filled':
        this._handlePushFilledOrder(order);
        break;
      case 'canceled':
        this._handlePushCanceledOrders(order);
        break;
      default:
        break;
    }
  };

  private _handlePushCanceledOrders(order: WsOrder) {
    const { clOrdId } = order;
    if (this._buyOrder && clOrdId === this._buyOrder.clOrdId) {
      this._buyOrder.order = undefined;
    } else if (this._sellOrder && clOrdId === this._sellOrder.clOrdId) {
      this._sellOrder.order = undefined;
    }
  }

  private _handlePushLiveOrders(order: WsOrder) {
    const { clOrdId } = order;
    if (clOrdId === this._buyOrder.clOrdId) {
      this._buyOrder.order = order;
    } else if (clOrdId === this._sellOrder.clOrdId) {
      this._sellOrder.order = order;
    }
  }

  private _handlePushFilledOrder(order: WsOrder) {
    const { clOrdId } = order;
    let newPrice: number | undefined = undefined;
    let clOrdIdToBeCancelled = '';
    if (clOrdId === this._buyOrder.clOrdId) {
      clOrdIdToBeCancelled = this._sellOrder.clOrdId;
      newPrice = this._px - this._gap;
    } else if (clOrdId === this._sellOrder.clOrdId) {
      clOrdIdToBeCancelled = this._buyOrder.clOrdId;
      newPrice = this._px + this._gap;
    }
    if (newPrice) {
      this._filledOrders.push(order);
      this._px = newPrice;
      if (Math.abs(this._px - this._basePx) / this._gap < this._levelCount) {
        this._cancelOrder(clOrdIdToBeCancelled);
        void this._initializeBooks();
      }
    }
  }

  private async _initializeBooks() {
    const buyOrderId = Order.getUuid();
    const {
      _orderClient: orderClient,
      _baseSz: baseSz,
      _gap: gap,
      _px: px,
      _factor: factor,
    } = this;
    this._buyOrder = {
      clOrdId: buyOrderId,
    };
    const buyOrderParams: WsPlaceOrderParams = this._constructPlaceOrderParams(
      buyOrderId,
      'buy',
      baseSz,
      (px - gap) / factor
    );
    await orderClient.placeOrder([buyOrderParams]);

    const sellOrdId = Order.getUuid();
    this._sellOrder = {
      clOrdId: sellOrdId,
    };
    const sellOrderParams: WsPlaceOrderParams = this._constructPlaceOrderParams(
      sellOrdId,
      'sell',
      baseSz,
      (px + gap) / factor
    );
    await orderClient.placeOrder([sellOrderParams]);
  }

  private _constructPlaceOrderParams = (
    clOrdId: string,
    side: WsOrderSide,
    sz: number,
    px: number
  ): WsPlaceOrderParams => {
    const instId = this._instId;
    return {
      instId,
      clOrdId,
      tdMode: 'isolated',
      side,
      sz: sz.toString(),
      px: px.toString(),
      ccy: this._ccy,
      ordType: 'limit',
      quickMgnType: 'auto_borrow',
    };
  };

  private _cancelOrder(clOrdId: string) {
    const { _orderClient: orderClient } = this;
    void orderClient.cancelOrder([
      {
        instId: this._instId,
        clOrdId,
      },
    ]);
  }

  public start() {
    this._on();
    void this._initializeBooks();
    this._started = true;
  }

  public stop() {
    this._off();
    if (this._buyOrder.order) {
      this._cancelOrder(this._buyOrder.clOrdId);
    }
    if (this._sellOrder.order) {
      this._cancelOrder(this._sellOrder.clOrdId);
    }
    this._started = false;
  }

  get config(): OkxPriceTraderConfig {
    return this._config;
  }

  get instId(): InstId {
    return this._instId;
  }

  get filledOrders(): WsOrder[] {
    return this._filledOrders;
  }

  get pendingOrders(): WsOrder[] {
    const value: WsOrder[] = [];
    this._buyOrder.order && value.push(this._buyOrder.order);
    this._sellOrder.order && value.push(this._sellOrder.order);
    return value;
  }

  get type(): TraderType {
    return 'price';
  }
  get subscriptions(): WsSubscriptionTopic[] {
    return [];
  }

  get started(): boolean {
    return this._started;
  }

  get id(): string {
    return this._id;
  }
}
