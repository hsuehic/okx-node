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

export class BaseTrader extends EventEmitter implements OkxTrader {
  protected _id: string;
  protected _config: OkxTraderConfig;
  protected _instId: InstId;
  protected _ccy: CryptoCurrency;
  protected _orderClient: Order;
  protected _okxWsClient: OkxWebSocketClient;
  protected _boughtSize = 0;
  protected _boughtPrice = 0;
  protected _soldSize = 0;
  protected _soldPrice = 0;
  protected _traderSize = 0;
  protected _buyOrder: {
    clOrdId?: string;
    order?: WsOrder;
  };
  protected _sellOrder: {
    clOrdId?: string;
    order?: WsOrder;
  };
  protected _started = false;
  protected _filledOrders: WsOrder[] = [];
  protected _name: string;

  /**
   * Construct and start high frequency trade
   * @param configs Configurations of trading
   */
  constructor(config: OkxTraderConfig) {
    super();
    const { instId, name } = config;
    this._id = Order.getUuid();
    this._config = config;
    this._instId = instId;
    const [ccy] = instId.split('-');
    this._ccy = ccy as CryptoCurrency;
    this._name = name;
    this._okxWsClient = okxWsClient;
    this._orderClient = new Order(okxWsClient);
    this._buyOrder = {
      clOrdId: undefined,
    };
    this._sellOrder = {
      clOrdId: undefined,
    };
    this._okxWsClient.on('push-orders', this._handlePushOrders);
  }

  /**
   * Please override this method in decendents
   */
  public start() {
    this._started = true;
    this._on();
  }

  /**
   * subscribe events
   */
  protected _on() {
    const { _orderClient: orderClient } = this;
    orderClient.on('order', this._handlePlaceOrderResponse);
    orderClient.on('cancel-order', this._handleCancelOrderResponse);
  }
  /**
   * unsubscribe events
   */
  protected _off() {
    const { _orderClient: orderClient } = this;
    orderClient.off('order', this._handlePlaceOrderResponse);
    orderClient.off('cancel-order', this._handleCancelOrderResponse);
  }

  /**
   * Handle place order response, currently, do nothing.
   * @param res
   */
  protected _handlePlaceOrderResponse = (res: WsPlaceOrderResponse) => {
    const { clOrdId } = res.data[0];
    if (res.code === '0' && clOrdId) {
      if (this._buyOrder && clOrdId === this._buyOrder.clOrdId) {
        console.log('Buy order was placed', JSON.stringify(res));
      } else if (this._sellOrder && clOrdId === this._sellOrder.clOrdId) {
        console.log('Sell order was placed', JSON.stringify(res));
      }
    }
  };

  /**
   * Handle cancel order response, currently, do nothing.
   * @param res
   */
  protected _handleCancelOrderResponse = (res: WsCancelOrderResponse) => {
    const { clOrdId } = res.data[0];
    if (res.code === '0' && clOrdId) {
      if (this._buyOrder && clOrdId === this._buyOrder.clOrdId) {
        this._buyOrder.order = undefined;
      } else if (this._sellOrder && clOrdId === this._sellOrder.clOrdId) {
        this._sellOrder.order = undefined;
      }
    }
  };

  protected _handlePushOrders = (push: WsPush) => {
    const { data } = push as WsPushOrders;
    const order = data[0];
    if (order.clOrdId) {
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
    }
  };

  protected _handlePushCanceledOrders(order: WsOrder) {
    const { clOrdId } = order;
    if (this._buyOrder && clOrdId === this._buyOrder.clOrdId) {
      this._buyOrder.order = undefined;
    } else if (this._sellOrder && clOrdId === this._sellOrder.clOrdId) {
      this._sellOrder.order = undefined;
    }
  }

  protected _handlePushLiveOrders(order: WsOrder) {
    const { clOrdId } = order;
    if (clOrdId === this._buyOrder.clOrdId) {
      this._buyOrder.order = order;
    } else if (clOrdId === this._sellOrder.clOrdId) {
      this._sellOrder.order = order;
    }
  }

  protected _handlePushFilledOrder(order: WsOrder) {
    const { clOrdId, sz, avgPx } = order;
    const size = parseFloat(sz);
    const avgPrice = parseFloat(avgPx);
    if (clOrdId === this._buyOrder.clOrdId) {
      this._boughtSize += size;
      this._traderSize += size;
      this._boughtPrice += size * avgPrice;
      this._buyOrder.order = undefined;
      this._filledOrders.push(order);
      if (this._sellOrder.order) {
        this._cancelOrder(this._sellOrder.order.ordId);
      }
    } else if (clOrdId === this._sellOrder.clOrdId) {
      this._soldSize += size;
      this._traderSize -= size;
      this._soldPrice += size * avgPrice;
      this._sellOrder.order = undefined;
      this._filledOrders.push(order);
      if (this._buyOrder.order) {
        this._cancelOrder(this._buyOrder.order.ordId);
      }
    }
  }

  protected _constructPlaceOrderParams = (
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

  protected _cancelOrder(ordId: string) {
    const { _orderClient: orderClient } = this;
    void orderClient.cancelOrder([
      {
        instId: this._instId,
        ordId,
      },
    ]);
  }

  public dispose(): void {
    this._okxWsClient.off('push-order', this._handlePushOrders);
  }

  public stop() {
    this._off();
    if (this._buyOrder.order) {
      this._cancelOrder(this._buyOrder.order.ordId);
    }
    if (this._sellOrder.order) {
      this._cancelOrder(this._sellOrder.order.ordId);
    }
    this._started = false;
  }

  get config(): OkxTraderConfig {
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
    return this.config.type;
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

  get boughtSize(): number {
    return this._boughtSize;
  }

  get boughtPrice(): number {
    return this._boughtPrice;
  }

  get soldSize(): number {
    return this._soldSize;
  }

  get soldPrice(): number {
    return this._soldPrice;
  }

  /**
   * Cumulative number of transactions, negative indicates net sales, positive indicates net buys
   */
  get tradeSize(): number {
    return this._boughtSize - this._soldSize;
  }

  /**
   * Cumulative cost of transactions
   */
  get tradePrice(): number {
    return this._soldPrice - this._boughtPrice;
  }
}
