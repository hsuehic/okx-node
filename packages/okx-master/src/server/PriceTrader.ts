import EventEmitter from 'events';

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
} from 'okx-node';

import { okxWsClient } from './clients';
import { OkxTrader } from './Trader';

/**
 * High Frequency Trader based on bid prices, ask prices, and order status
 * in order to make it work need to subscribe the needed channels(get by instance.channels);
 * Two books will co-exist at the same time that when one book is filled, the other one will be cancelled, two new orders will books will be sent using new prices.
 * e.g. the base price is `0.50`. and gap is `0.005`. 2 books will be initialized when starting, the sell book is at price `0.505`, the buy book will be at price `0.495`.
 * if the buy book is filled, the new books will be buy book at 0.49 and sell book at 0.50. the size of the books will be determined by `coefficient`, using formula `size = Math.pow(coeffient, Math.abs(orderPx - basePx)/gap) * baseSz`;
 */
export class OkxPriceTrader extends EventEmitter implements OkxTrader {
  private _id: string;
  private _config: OkxPriceTraderConfig;
  private _instId: InstId;
  private _px: number;
  private _ccy: CryptoCurrency;
  private _maxPx: number;
  private _minPx: number;
  private _baseSz: number;
  private _gap: number;
  private _factor = 1000;
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
  private _name: string;

  /**
   * Construct and start high frequency trade
   * @param configs Configurations of trading
   */
  constructor(config: OkxPriceTraderConfig) {
    super();
    const { instId, basePx, baseSz, gap, levelCount, name } = config;
    this._id = Order.getUuid();
    this._config = config;
    this._instId = instId;
    const [ccy] = instId.split('-');
    this._ccy = ccy as CryptoCurrency;
    this._px = basePx * this._factor;
    this._gap = gap * this._factor;
    this._minPx = this._px - this._gap * levelCount;
    this._maxPx = this._px + this._gap * levelCount;
    this._baseSz = baseSz;
    this._name = name;
    this._okxWsClient = okxWsClient;
    this._orderClient = new Order(okxWsClient);
    this._buyOrder = {
      clOrdId: '',
    };
    this._sellOrder = {
      clOrdId: '',
    };
    this.start();
    this._okxWsClient.on('push-orders', this._handlePushOrders);
  }

  /**
   * subscribe events
   */
  private _on() {
    const { _orderClient: orderClient } = this;
    orderClient.on('order', this._handlePlaceOrderResponse);
    orderClient.on('cancel-order', this._handleCancelOrderResponse);
  }
  /**
   * unsubscribe events
   */
  private _off() {
    const { _orderClient: orderClient } = this;
    orderClient.off('order', this._handlePlaceOrderResponse);
    orderClient.off('cancel-order', this._handleCancelOrderResponse);
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
      this._buyOrder.clOrdId = '';
      this._buyOrder.order = undefined;
      clOrdIdToBeCancelled = this._sellOrder.clOrdId;
      newPrice = this._px - this._gap;
    } else if (clOrdId === this._sellOrder.clOrdId) {
      this._sellOrder.clOrdId = '';
      this._sellOrder.order = undefined;
      clOrdIdToBeCancelled = this._buyOrder.clOrdId;
      newPrice = this._px + this._gap;
    }
    if (newPrice) {
      this._filledOrders.push(order);
      this._px = newPrice;
      if (clOrdIdToBeCancelled) {
        this._cancelOrder(clOrdIdToBeCancelled);
      }
      void this._initializeBooks();
    }
  }

  private _validatePrice(px: number) {
    return px >= this._minPx && px <= this._maxPx;
  }

  private async _initializeBooks(orderSide: OrderSide = 'any') {
    const {
      _orderClient: orderClient,
      _baseSz: baseSz,
      _gap: gap,
      _px: px,
      _factor: factor,
    } = this;
    if (orderSide === 'any' || orderSide === 'buy') {
      const buyPx = px - gap;
      if (buyPx <= this._maxPx && buyPx >= this._minPx) {
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

    if (orderSide === 'any' || orderSide === 'sell') {
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
      tag: this._name,
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
    void this._initializeBooks(this._config.initialOrder);
    this._started = true;
  }

  public dispose(): void {
    this._okxWsClient.off('push-order', this._handlePushOrders);
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

  get status(): TraderStatus {
    return this._started ? 'running' : 'stopped';
  }

  get id(): string {
    return this._id;
  }
  get name(): string {
    return this._name;
  }
}
