import { WsOrder, WsSubscriptionTopic } from 'okx-node';

export interface OkxTrader {
  /**
   * Trader type
   */
  type: TraderType;
  /**
   * start monitoring the price/books of the instrument, and placing orders when terms are met
   */
  start(): void;
  /**
   * stop monitoring the price/books and placing orders
   */
  stop(): void;
  /**
   * release the resources, such unsubscribe events
   */
  dispose(): void;
  /**
   * get the instrument for the order master
   */
  instId?: InstId;
  /**
   * Filled orders placed by this trader
   */
  filledOrders: WsOrder[];
  /**
   * Pending orders placed by this trader
   */
  pendingOrders: WsOrder[];
  /**
   * push subscriptions used by this trader
   */
  subscriptions: WsSubscriptionTopic[];

  /**
   * trader status
   */
  status: TraderStatus;
  /**
   * Configuration
   */
  config: OkxTraderConfig;
  /**
   * Unique ID
   */
  id: string;
  /**
   * Name
   */
  name: string;

  boughtSize: number;

  boughtPrice: number;

  soldSize: number;

  soldPrice: number;

  tradedSize: number;

  tradedPrice: number;
}
