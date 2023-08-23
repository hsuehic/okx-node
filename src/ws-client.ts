import { EventEmitter } from 'events';

import WebSocket from 'ws';

import { WsSubscriptionTopic } from './type/meta.js';
import { PushChannel, WsPush } from './type/push.js';
import {
  WsChannelSubUnSubRequestArg,
  WsSubRequest,
  WsTradeBaseRequest,
  WsUnsubRequest,
} from './type/request.js';
import {
  WsFailureResponse,
  WsLoginResonse,
  WsResponse,
  WsSubscribeResponse,
  WsTradeResponse,
} from './type/response.js';
import { signMessage } from './util/authorization-node.js';
import {
  MARKET,
  WS_KEY,
  deepObjectMatch,
  getWsKeyForTopicChannel,
  getWsUrl,
} from './ws-util.js';

/**
 * OkxWsClientOptions
 */
export interface Options {
  market: MARKET;
  apiKey: string;
  passphrase: string;
  secretKey: string;
}

/**
 * declare overrote methods of OkxWebSocketClient
 */
export declare interface OkxWebSocketClient {
  emit(event: 'login'): boolean;
  emit(event: 'error', data: WsFailureResponse): void;
  emit(event: 'subscribe', data: WsSubscribeResponse): void;
  emit(event: 'trade', data: WsTradeResponse): void;
  emit(event: PushChannel, data: WsPush): void;

  on(event: 'login', listener: () => void): this;
  on(event: 'error', listener: (data: WsFailureResponse) => void): this;
  on(event: 'subscribe', listeneer: (data: WsSubscribeResponse) => void): this;
  on(event: 'trade', listerner: (data: WsTradeResponse) => void): this;
  on(event: PushChannel, listener: (data: WsPush) => void): this;
}

export class OkxWebSocketClient extends EventEmitter {
  /**
   * WebSocket clients for different channels
   */
  private _clients: Record<WS_KEY, WebSocket>;

  private _apiKey: string;
  private _passphrase: string;
  private _secretKey: string;
  private _authorized = false;
  /**
   * Type of ws endpoint
   */
  private _market: MARKET;
  /**
   * subcriptions, when reconnect need to re-subscribe
   */
  private _subscribes = new Map<WS_KEY, Set<WsSubscriptionTopic>>();
  /**
   * Timer for last activities
   */
  private _pingPongTimer: {
    lastSend: Record<WS_KEY, number>;
    lastReceived: Record<WS_KEY, number>;
  } = {
    lastSend: {
      business: Date.now() / 1000,
      private: Date.now() / 1000,
      public: Date.now() / 1000,
    },
    lastReceived: {
      business: Date.now() / 1000,
      private: Date.now() / 1000,
      public: Date.now() / 1000,
    },
  };

  /**
   * @deprecated use `OkxWebSocket.getInstance` instead to ensure the application will use the same clients all the time.
   */
  constructor(options: Options) {
    super();
    this._apiKey = options.apiKey;
    this._secretKey = options.secretKey;
    this._passphrase = options.passphrase;
    this._market = options.market;
    this._subscribes.set('business', new Set<WsChannelSubUnSubRequestArg>());
    this._subscribes.set('private', new Set<WsChannelSubUnSubRequestArg>());
    this._subscribes.set('public', new Set<WsChannelSubUnSubRequestArg>());

    /**
     * ws clients for private, public, business ws endpoint
     */
    this._clients = {
      business: this._initClient('business'),
      private: this._initClient('private'),
      public: this._initClient('public'),
    };
  }

  /**
   * Init WebSocket Client for certain Channel
   * @param key {WebSocketChannelKey}
   * @returns {WebSocket}
   */
  private _initClient(key: WS_KEY, reassign = false): WebSocket {
    const wsUrl = getWsUrl(this._market, key);
    const socket = new WebSocket(wsUrl);
    socket.on('close', () => {
      this._initClient(key, true);
    });
    socket.on('open', () => {
      if (key === 'private') {
        this._loginToPrivateChannel();
      }
    });
    socket.on('message', (data: WebSocket.RawData, isBinary: boolean) => {
      this._onMessage(key, data, isBinary);
    });
    if (reassign) {
      this._clients[key] = new WebSocket(wsUrl);
    }
    return socket;
  }

  /**
   * log for last activities
   * @param wsKey WS client
   * @param isReceived whether is receiving message, otherwise is sending message
   */
  private _logTimer(wsKey: WS_KEY, isReceived = false) {
    const record = isReceived
      ? this._pingPongTimer.lastReceived
      : this._pingPongTimer.lastSend;
    record[wsKey] = Date.now() / 1000;
  }

  /**
   * Login to private channel
   */
  private _loginToPrivateChannel() {
    const timestamp = Date.now() / 1000;

    const sign = signMessage(
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
    this._send('private', request);
  }

  /**
   * Handle message received from a specific WS sockect endpoint
   * @param key {WebSocketChannelKey} Key of the channel
   * @param message Message content
   */
  private _onMessage(
    wsKey: WS_KEY,
    data: WebSocket.RawData,
    isBinary: boolean
  ) {
    this._pingPongTimer.lastReceived[wsKey] = Date.now() / 1000;
    if (!isBinary) {
      const msgStr = data.toString();
      if (msgStr !== 'pong') {
        const msgObj = JSON.parse(msgStr) as object;
        const { event } = msgObj as Exclude<WsResponse, WsTradeResponse>;
        switch (event) {
          case 'error':
            this._handleFailureResponse(msgObj as WsFailureResponse);
            break;
          case 'login':
            this._handleLoginResponse(msgObj as WsLoginResonse);
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
      }
    }
  }

  private _handleFailureResponse(res: WsFailureResponse) {
    this.emit('error', res);
  }

  private _handleLoginResponse(_res: WsLoginResonse) {
    this.emit('login');
  }

  private _handleSubscribeResponse(res: WsSubscribeResponse) {
    this.emit('subscribe', res);
  }

  private _handleTradeResponse(res: WsTradeResponse) {
    this.emit('trade', res);
  }

  private _handlePush(push: WsPush) {
    this.emit(`push-${push.arg.channel}`, push);
  }

  /**
   * Send message to certain WS endpoint
   * @param wsKey Key of the WS endpoint
   * @param message Message content
   */
  private _send(wsKey: WS_KEY, message: string | object) {
    const msg = typeof message !== 'string' ? JSON.stringify(message) : message;

    const socket = this._clients[wsKey];
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(msg);
      this._logTimer(wsKey);
    } else {
      socket.on('open', () => {
        socket.send(msg);
        this._logTimer(wsKey);
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
      subscriptions?.forEach(storedArg => {
        if (deepObjectMatch(storedArg, arg)) {
          return storedArg;
        }
      });
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

  /**
   * Subscribe push from a certain channel
   * @param req request object
   */
  public subscribe<T extends WsSubscriptionTopic = WsSubscriptionTopic>(
    req: WsSubRequest<T>
  ) {
    this._subUnsub(req);
  }

  /**
   * Unsubscribe push from a certain channel
   * @param req request object
   */
  public unsubscribe(req: WsUnsubRequest) {
    this._subUnsub(req);
  }

  /**
   * trigger order actions over websockets (e.g. placing & cancelling orders)
   * @param req request object
   */
  public trade<T>(req: WsTradeBaseRequest<T>) {
    this._send('private', req);
  }

  /**
   * Wait for availability of private ws endpoing, we can only subscribe and get pushed message after this
   * @returns Promise
   */
  public async privateChannelReady(): Promise<boolean> {
    if (this._authorized) {
      return true;
    } else {
      const p = new Promise<boolean>(resolve => {
        this.on('login', () => {
          resolve(true);
        });
      });
      return p;
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
