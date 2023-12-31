/* eslint-disable max-lines */
import { EventEmitter } from 'events';

import WebSocket, { MessageEvent } from 'isomorphic-ws';
import { signMessage } from 'okx-sign';

import {
  PushChannel,
  WsChannelSubUnSubRequestArg,
  WsFailureResponse,
  WsLoginResonse,
  WsPush,
  WsResponse,
  WsSubRequest,
  WsSubscribeResponse,
  WsSubscriptionTopic,
  WsTradeBaseRequest,
  WsTradeResponse,
  WsUnsubRequest,
} from './type';
import {
  WsKey,
  WsMarket,
  deepObjectMatch,
  getWsKeyForTopicChannel,
  getWsUrl,
} from './ws-util';

/**
 * OkxWsClientOptions
 */
export interface Options {
  market: WsMarket;
  /**
   * set apiKey, passphrase, and secretKey, it will login to channels that need authorization, otherwise it won't init private channel.
   */
  apiKey?: string;
  /**
   * set, it will login to channels that need authorization
   */
  passphrase?: string;
  /**
   * set, it will login to channels that need authorization
   */
  secretKey?: string;
  /**
   * in ms, if not set, it will use default value 3000
   */
  heartbeatInterval?: number;
}

export type LogType =
  | 'send'
  | 'login'
  | 'errorResponse'
  | 'subscribe'
  | 'trade'
  | 'ping'
  | 'pong'
  | PushChannel;
export type LogSettings = Partial<Record<LogType, boolean>>;

export const WS_KEYS: WsKey[] = ['business', 'private', 'public'];

/**
 * declare overrote methods of OkxWebSocketClient
 */
export declare interface OkxWebSocketClient {
  emit(event: 'login', wsKey: string): boolean;
  emit(event: 'errorResponse', data: WsFailureResponse): boolean;
  emit(event: 'subscribe', data: WsSubscribeResponse): boolean;
  emit(event: 'trade', data: WsTradeResponse): boolean;
  emit(event: PushChannel, data: WsPush): boolean;
  emit(event: 'open', wsKey: string): boolean;

  on(event: 'login', listener: (wsKey: WsKey) => void): this;
  on(event: 'errorResponse', listener: (data: WsFailureResponse) => void): this;
  on(event: 'subscribe', listener: (data: WsSubscribeResponse) => void): this;
  on(event: 'trade', listerner: (data: WsTradeResponse) => void): this;
  on(event: PushChannel, listener: (data: WsPush) => void): this;
  on(event: 'open', listener: (wsKey: WsKey) => void): this;
}

export class OkxWebSocketClient extends EventEmitter {
  /**
   * WebSocket clients for different channels
   */
  private _clients: { [key in WsKey]?: WebSocket };

  private _apiKey: string;
  private _passphrase: string;
  private _secretKey: string;
  private _timerId: NodeJS.Timer;
  private _activeClients: WsKey[];
  private _privateChannelReady: {
    private: boolean;
    business: boolean;
  } = {
    private: false,
    business: false,
  };

  /**
   * Type of ws endpoint
   */
  private _market: WsMarket;
  /**
   * subcriptions, when reconnect need to re-subscribe
   */
  private _subscribes = new Map<WsKey, Set<WsSubscriptionTopic>>();
  /**
   * Timer for last activities
   */
  private _pingPongTimer: {
    lastSend: Record<WsKey, number>;
    lastReceived: Record<WsKey, number>;
  } = {
    lastSend: {
      business: Date.now(),
      private: Date.now(),
      public: Date.now(),
    },
    lastReceived: {
      business: Date.now(),
      private: Date.now(),
      public: Date.now(),
    },
  };

  private _heartbeatInterval: number;

  private _verbose: LogSettings = {
    errorResponse: true,
  };

  constructor(options: Options) {
    super();
    this._apiKey = options.apiKey;
    this._secretKey = options.secretKey;
    this._passphrase = options.passphrase;
    this._market = options.market;
    this._subscribes.set('business', new Set<WsChannelSubUnSubRequestArg>());
    this._subscribes.set('private', new Set<WsChannelSubUnSubRequestArg>());
    this._subscribes.set('public', new Set<WsChannelSubUnSubRequestArg>());

    if (this._needToLogin()) {
      this._activeClients = ['business', 'private', 'public'];
    } else {
      this._activeClients = ['business', 'public'];
    }
    this._clients = {};

    for (const key of this._activeClients) {
      this._clients[key] = this._initClient(key);
    }

    this._heartbeatInterval = options.heartbeatInterval || 3000;
    this._timerId = setInterval(() => {
      this._sendPing();
      this._checkHeartbeat();
    }, this._heartbeatInterval);
  }

  /**
   * Init WebSocket Client for certain Channel
   * @param key {WebSocketChannelKey}
   * @returns {WebSocket}
   */
  private _initClient(key: WsKey, reassign = false): WebSocket {
    const wsUrl = getWsUrl(this._market, key);
    const socket = new WebSocket(wsUrl);
    socket.onclose = () => {
      if (key === 'private' || key === 'business') {
        this._privateChannelReady[key] = false;
      }
      this._initClient(key, true);
    };
    socket.onopen = () => {
      this.emit('open', key);
      if (key !== 'public') {
        void this._loginToWsClient(key);
      }
      if (reassign) {
        if (key === 'public') {
          this._reSubAfterReconnect(key);
        } else {
          if (this._needToLogin()) {
            void this.privateChannelReady(key).then(() => {
              this._reSubAfterReconnect(key);
            });
          } else {
            this._reSubAfterReconnect(key);
          }
        }
      }
    };
    socket.onmessage = (evnt: MessageEvent) => {
      const { data } = evnt;
      this._onMessage(key, String(data));
    };
    if (reassign) {
      this._clients[key] = socket;
    }
    return socket;
  }

  private _sendPing() {
    for (const key of this._activeClients) {
      if (this._clients[key].readyState === WebSocket.OPEN) {
        this._clients[key].send('ping');
        this._log('ping', `[${key}]`, 'ping');
      }
    }
  }

  /**
   * log for last activities
   * @param wsKey WS client
   * @param isReceived whether is receiving message, otherwise is sending message
   */
  private _logTimer(wsKey: WsKey, isReceived = false) {
    const record = isReceived
      ? this._pingPongTimer.lastReceived
      : this._pingPongTimer.lastSend;
    record[wsKey] = Date.now();
  }

  private _needToLogin(): boolean {
    return !!(this._apiKey && this._passphrase && this._secretKey);
  }

  /**
   * Login to private channel
   */
  private async _loginToWsClient(key: WsKey) {
    const timestamp = (Date.now() / 1000).toFixed(0);

    if (this._needToLogin()) {
      const sign = await signMessage(
        timestamp.toString() + 'GET' + '/users/self/verify',
        this._secretKey
      );
      const request = {
        op: 'login',
        args: [
          {
            apiKey: this._apiKey,
            passphrase: this._passphrase,
            timestamp,
            sign,
          },
        ],
      };
      this._send(key, request);
    }
  }

  /**
   * Handle message received from a specific WS sockect endpoint
   * @param key {WebSocketChannelKey} Key of the channel
   * @param message Message content
   */
  private _onMessage(wsKey: WsKey, data: string) {
    this._pingPongTimer.lastReceived[wsKey] = Date.now();

    const msgStr = data.toString();
    if (msgStr !== 'pong') {
      const msgObj = JSON.parse(msgStr) as object;

      const { event } = msgObj as Exclude<WsResponse, WsTradeResponse>;
      switch (event) {
        case 'error':
          this._handleFailureResponse(msgObj as WsFailureResponse);
          break;
        case 'login':
          this._handleLoginResponse(wsKey, msgObj as WsLoginResonse);
          break;
        case 'subscribe':
        case 'unsubscribe':
          this._handleSubscribeResponse(msgObj as WsSubscribeResponse);
          break;
        default:
          break;
      }
      const { id, op } = msgObj as WsTradeResponse;
      if (id && op) {
        this._handleTradeResponse(msgObj as WsTradeResponse);
      }
      const { arg, data } = msgObj as WsPush;
      if (arg && data) {
        this._handlePush(msgObj as WsPush);
      }
    } else {
      this._logTimer(wsKey, true);
      this._log('pong', `[${wsKey}] pong`);
    }
  }

  private _handleFailureResponse(res: WsFailureResponse) {
    this.emit('errorResponse', res);
    this._log('errorResponse', 'Error', res);
  }

  private _handleLoginResponse(wsKey: WsKey, res: WsLoginResonse) {
    this._privateChannelReady[wsKey] = true;
    this.emit('login', wsKey);
    this._log('login', 'Login', res);
  }

  private _handleSubscribeResponse(res: WsSubscribeResponse) {
    this.emit('subscribe', res);
    this._log('subscribe', 'Subscribe', res);
  }

  private _handleTradeResponse(res: WsTradeResponse) {
    this.emit('trade', res);
    this._log('trade', 'Trade', res);
  }

  private _handlePush(push: WsPush) {
    const eventName = `push-${push.arg.channel}` as const;
    this.emit(eventName, push);
    this._log(eventName, push.arg.channel, push);
  }

  /**
   * Send message to certain WS endpoint
   * @param wsKey Key of the WS endpoint
   * @param message Message content
   */
  private _send(wsKey: WsKey, message: string | object) {
    this._log('send', `[${wsKey}] sent:`, message);
    const msg = typeof message !== 'string' ? JSON.stringify(message) : message;
    const socket = this._clients[wsKey];
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(msg);
      this._logTimer(wsKey);
    } else {
      this.once('open', (key: WsKey) => {
        if (wsKey === key) {
          socket.send(msg);
          this._logTimer(wsKey);
        }
      });
    }
  }

  /**
   * Subscribe/unsubscribe push for a certain ws endpoint
   * @param req request args, need to make sure all the args are from the same channel
   * @param resubWhenReconnect whether to resubscript or not when reconnect
   */
  private _subUnsub(
    req: WsSubRequest | WsUnsubRequest,
    resubWhenReconnect = true
  ) {
    const { args } = req;
    if (args.length < 1) return;
    const arg = args[0];
    const { channel } = arg;
    const wsKey = getWsKeyForTopicChannel(channel);
    const { op } = req;
    const subscriptions = this._subscribes.get(wsKey);
    const findEqualArg = (
      arg: WsSubscriptionTopic
    ): WsSubscriptionTopic | void => {
      for (const storedArg of subscriptions) {
        if (deepObjectMatch(storedArg, arg)) {
          return storedArg;
        }
      }
    };
    if (op === 'unsubscribe') {
      for (const a of args) {
        const storedArg = findEqualArg(a);
        if (storedArg) {
          subscriptions.delete(storedArg);
        }
      }
    } else if (resubWhenReconnect) {
      for (const a of args) {
        if (!findEqualArg(a)) {
          subscriptions.add(a);
        }
      }
    }
    this._send(wsKey, req);
  }

  private _checkHeartbeat() {
    const { lastReceived, lastSend } = this._pingPongTimer;
    for (const key of this._activeClients) {
      const now = Date.now();
      if (lastSend[key] - lastReceived[key] > this._heartbeatInterval * 3) {
        const socket = this._clients[key];
        // close the client to force re-connect
        try {
          socket.close(1);
        } catch (ex) {
          console.error(ex);
        }
        // reset loger timestamp to avoid forcing closing again when re-connecting and re-subscribing
        lastSend[key] = now;
        lastReceived[key] = now;
      }
    }
  }

  /**
   * re-subscribe all when re-connect worksocked client
   * @param wsKey
   */
  private _reSubAfterReconnect(wsKey: WsKey) {
    const subscribtions = this._subscribes.get(wsKey);
    subscribtions.forEach((subscription: WsSubscriptionTopic) => {
      this._subUnsub(
        {
          op: 'subscribe',
          args: [subscription],
        },
        true
      );
    });
  }

  /**
   * Subscribe push from a certain channel
   * @param req request object
   */
  public subscribe<T extends WsSubscriptionTopic = WsSubscriptionTopic>(
    arg: T
  ) {
    const req: WsSubRequest<T> = {
      op: 'subscribe',
      args: [arg],
    };
    this._subUnsub(req);
  }

  /**
   * Unsubscribe push from a certain channel
   * @param req request object
   */
  public unsubscribe<T extends WsSubscriptionTopic = WsSubscriptionTopic>(
    arg: T
  ) {
    const req: WsUnsubRequest<T> = {
      op: 'unsubscribe',
      args: [arg],
    };
    this._subUnsub(req);
  }

  /**
   * trigger order actions over websockets (e.g. placing & cancelling orders)
   * @param req request object
   */
  public trade<T>(req: WsTradeBaseRequest<T>) {
    this._send('private', req);
  }

  public get verbose() {
    return this._verbose;
  }

  public set verbose(value: LogSettings) {
    this._verbose = { ...this._verbose, ...value };
  }

  private _log(t: LogType, ...contents: unknown[]) {
    if (this._verbose[t]) {
      console.log(...contents);
    }
  }

  /**
   * Wait for availability of private ws endpoing, we can only subscribe and get pushed message after this
   * @returns Promise
   */
  public async privateChannelReady(
    key: 'private' | 'business'
  ): Promise<boolean> {
    if (this._privateChannelReady[key]) {
      return Promise.resolve(true);
    } else {
      const p = new Promise<boolean>(resolve => {
        this.on('login', (wsKey: WsKey) => {
          if (wsKey === key) {
            resolve(true);
          }
        });
      });
      return p;
    }
  }

  /**
   * Release resources
   */
  public dispose() {
    for (const key of this._activeClients) {
      const client = this._clients[key];
      client.onclose = null;
      client.onmessage = null;
      client.onopen = null;
      client.close();
      delete this._clients[key];
    }
    if (this._timerId) {
      clearInterval(this._timerId);
    }
  }

  /**
   * unique client, sole client
   */
  private static _instance: OkxWebSocketClient;
  static getInstance(opts: Options): OkxWebSocketClient {
    if (!this._instance) {
      this._instance = new OkxWebSocketClient(opts);
    }
    return this._instance;
  }
}
