import EventEmitter from 'events';

import { okxWsClient } from './instanse.js';
import { WsBalanceData, WsPositionData } from './type/meta.js';
import { WsPush, WsPushArg } from './type/push.js';
import { OkxWebSocketClient } from './ws-client.js';

export interface WsAssetInfo {
  availBal: string;
  availEq: string;
  ccy: string;
  cashBal: string;
  uTime: string;
  disEq: string;
  eq: string;
  eqUsd: string;
  frozenBal: string;
  interest: string;
  isoEq: string;
  liab: string;
  maxLoan: string;
  mgnRatio: string;
  notionalLever: string;
  ordFrozen: string;
  upl: string;
  uplLiab: string;
  crossLiab: string;
  isoLiab: string;
  coinUsdPrice: string;
  stgyEq: string;
  spotInUseAmt: string;
  isoUpl: string;
  borrowFroz: string;
}
export interface WsAccoutInfo {
  /**
   * The latest time to get account information, millisecond format of Unix timestamp, e.g. 1597026383085
   */
  uTime: string;
  /**
   * The total amount of equity in USD
   */
  totalEq: string;
  /**
   * 	Isolated margin equity in USD
   * Applicable to Single-currency margin and Multi-currency margin and Portfolio margin
   */
  isoEq: string;
  /**
   * Adjusted / Effective equity in USD
   * The net fiat value of the assets in the account that can provide margins for spot, futures, perpetual swap and options under the cross margin mode.
   * Cause in multi-ccy or PM mode, the asset and margin requirement will all be converted to USD value to process the order check or liquidation.
   * Due to the volatility of each currency market, our platform calculates the actual USD value of each currency based on discount rates to balance market risks.
   * Applicable to Multi-currency margin and Portfolio margin
   */
  adjEq: string;
  /**
   * Margin frozen for pending cross orders in USD
   * Only applicable to Multi-currency margin
   */
  ordFroz: string;
  /**
   * Initial margin requirement in USD
   * The sum of initial margins of all open positions and pending orders under cross margin mode in USD.
   * Applicable to Multi-currency margin and Portfolio margin
   */
  imr: string;
  /**
   * Maintenance margin requirement in USD
   * The sum of maintenance margins of all open positions under cross margin mode in USD.
   * Applicable to Multi-currency margin and Portfolio margin
   */
  mmr: string;
  /**
   * Potential borrowing IMR of the account in USD
   * Only applicable to Multi-currency margin and Portfolio margin. It is "" for other margin modes.
   */
  borrowFroz: string;
  /**
   * Notional value of positions in USD
   * Applicable to Multi-currency margin and Portfolio margin
   */
  notionalUsd: string;
  /**
   * Margin ratio in USD
   * The index for measuring the risk of a certain asset in the account.
   * Applicable to Multi-currency margin and Portfolio margin
   */
  mgnRatio: string;
  details: WsAssetInfo[];
}

export interface WsPushAccountArg extends WsPushArg {
  channel: 'account';
  uid: string;
  ccy?: string;
}

export interface WsPushBalAndPosArg extends WsPushArg {
  channel: 'balance_and_position';
  uid: string;
}

export interface WsBalAndPosData {
  pTime: string;
  eventType: string;
  balData: WsBalanceData[];
  posData: WsPositionData[];
}

export type WsPushAccount = WsPush<WsPushAccountArg, WsAccoutInfo>;

export type WsPushBalAndPos = WsPush<WsPushBalAndPosArg, WsBalAndPosData>;

export interface Account {
  emit(event: 'push-account', data: WsAccoutInfo): boolean;
  emit(event: 'push-balance_and_position', data: WsBalAndPosData): boolean;
  on(event: 'push-account', listerner: (data: WsAccoutInfo) => void): this;
  on(
    event: 'push-balance_and_position',
    listerner: (data: WsBalAndPosData) => void
  ): this;
}
export class Account extends EventEmitter {
  private _okxWsClient: OkxWebSocketClient;
  private _accountInfo: WsAccoutInfo | undefined;
  private _bal: WsBalanceData[] = [];
  private _pos: WsPositionData[] = [];

  constructor() {
    super();
    this._okxWsClient = okxWsClient;
    void this._okxWsClient.privateChannelReady().then(() => {
      this._subscribe();
    });
    this._okxWsClient.on('push-account', (push: WsPush) => {
      this._handlePushAccount(push as WsPushAccount);
    });
    this._okxWsClient.on('push-balance_and_position', (push: WsPush) => {
      this._handlePushBalAdnPos(push as WsPushBalAndPos);
    });
  }
  private _subscribe() {
    this._subscribeAccount();
  }
  private _subscribeAccount() {
    this._okxWsClient.subscribe({
      op: 'subscribe',
      args: [
        {
          channel: 'account',
          extraParams: {
            updateInterval: 1000,
          },
        },
        {
          channel: 'balance_and_position',
        },
      ],
    });
  }
  private _handlePushAccount(push: WsPushAccount) {
    const { data } = push;
    this._accountInfo = data;
    this.emit('push-account', data);
  }
  private _handlePushBalAdnPos(push: WsPushBalAndPos) {
    const { data } = push;
    this._bal = data.balData;
    this._pos = data.posData;
    this.emit('push-balance_and_position', data);
  }
  public get accountInfo(): WsAccoutInfo | undefined {
    {
      return this._accountInfo;
    }
  }

  public get balanceData(): WsBalanceData[] {
    return this._bal;
  }

  public get positionData(): WsPositionData[] {
    return this._pos;
  }
}
