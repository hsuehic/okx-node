export interface OkxMaster {
  /**
   * calculate orders that need to be placed when it receives pushes of order status/books
   */
  calculateBooks(): Promise<void>;
  /**
   * start monitoring the price/books of the instrument, and placing orders when terms are met
   */
  start(): void;
  /**
   * stop monitoring the price/books and placing orders
   */
  stop(): void;
  /**
   * release the resources(subscriptions) for the order master
   */
  dispose(): void;
  /**
   * get the instrument for the order master
   */
  getInstrument(): string;
  /**
   * get the unrealize profit of the order master since created
   */
  getUnrealizedProfit(): number;
}

export class OkxMasterClass {
  private _instId: InstId;
  constructor(instId: InstId) {
    this._instId = instId;
  }
}
