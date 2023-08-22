import { EventEmitter } from 'events';

import { HmacSHA256, enc } from 'crypto-js';
import WebSocket from 'ws';

import { URL_WEBSOCKET, WebSocketChannelKey } from './constant';

export type WebSocketRequestType = 'login' | 'subscribe' | 'unsubscribe';
export type WebSocketReqponseType = WebSocketRequestType | 'error';

export type Channel =
  | 'account'
  | 'orders'
  | 'rfqs'
  | 'quotes'
  | 'struc-block-trades'
  | 'tickers'
  | 'public-struc-block-trades'
  | 'instruments'
  | 'open-interest'
  | 'funding-rate'
  | 'price-limit'
  | 'opt-summary'
  | 'estimated-price'
  | 'deposit-info'
  | 'withdrawal-info'
  | 'liquidation-orders'
  | 'balance_and_position';

export interface Arg {
  channel?: Channel;
}

export interface WebSocketRequest<T extends Arg> {
  op: WebSocketRequestType;
  args: T[];
}

export interface WebSocketResponse<T extends Arg> {
  event: WebSocketReqponseType;
  arg: T;
}

export interface WebSocketLoginResponse {
  event: 'login';
  code: string;
  msg: string;
}

export interface WebSocketPush<T extends Arg, TD> {
  arg: T;
  data: TD[];
}

export interface Options {
  apiKey: string;
  passphrase: string;
  secretKey: string;
}

export interface ResponseEventData<T extends Arg> {
  channel: WebSocketChannelKey;
  data: WebSocketResponse<T>;
}

export interface PushEventData<T extends Arg, TD> {
  channel: WebSocketChannelKey;
  data: WebSocketPush<T, TD>;
}

export declare interface OkxWebSocketClient {
  emit(event: 'authorized'): boolean;
  emit<T extends Arg, TD>(event: 'push', data: PushEventData<T, TD>): boolean;
  emit<T extends Arg>(event: 'response', data: ResponseEventData<T>): boolean;
  on(event: 'authorized', listener: () => void): this;
  on(
    event: 'push',
    listener: <T extends Arg, TD>(data: PushEventData<T, TD>) => void
  ): this;
  on(
    event: 'response',
    listener: <T extends Arg>(data: {
      channel: WebSocketChannelKey;
      data: WebSocketResponse<T>;
    }) => void
  ): this;
}

export class OkxWebSocketClient extends EventEmitter {
  /**
   * WebSocket clients for different channels
   */
  private _clients: Record<WebSocketChannelKey, WebSocket>;

  private _apiKey: string;
  private _passphrase: string;
  private _secretKey: string;
  private _authorized = false;

  /**
   * @deprecated use `OkxWebSocket.getInstance` instead to ensure the application will use the same clients all the time.
   */
  constructor(options: Options) {
    super();
    this._apiKey = options.apiKey;
    this._secretKey = options.secretKey;
    this._passphrase = options.passphrase;

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
  private _initClient(key: WebSocketChannelKey, reassign = false): WebSocket {
    const socket = new WebSocket(URL_WEBSOCKET[key]);
    socket.on('close', () => {
      this._initClient(key, true);
    });
    socket.on('open', () => {
      if (key === 'private') {
        this._loginToPrivateChannel();
      }
    });
    socket.on('message', (data: WebSocket.RawData, isBinary: boolean) => {
      this._handleMessage(key, data, isBinary);
    });
    if (reassign) {
      this._clients[key] = new WebSocket(URL_WEBSOCKET[key]);
    }
    return socket;
  }

  /**
   * Login to private channel
   */
  private _loginToPrivateChannel() {
    const timestamp = Date.now() / 1000;

    const sign = enc.Base64.stringify(
      HmacSHA256(
        timestamp.toString() + 'GET' + '/users/self/verify',
        this._secretKey
      )
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
    this.send('private', request);
  }

  /**
   * Handle message received from a specific channel
   * @param key {WebSocketChannelKey} Key of the channel
   * @param message Message content
   */
  private _handleMessage(
    channel: WebSocketChannelKey,
    data: WebSocket.RawData,
    isBinary: boolean
  ) {
    if (!isBinary) {
      const msg = JSON.parse(data.toString()) as
        | WebSocketResponse<Arg>
        | WebSocketPush<Arg, unknown>;
      console.log(msg);
      if (Object.prototype.hasOwnProperty.bind(msg)('event')) {
        const res: WebSocketResponse<object> = msg as WebSocketResponse<object>;
        if (res.event === 'login') {
          if ((res as unknown as WebSocketLoginResponse).code === '0') {
            this.emit('authorized');
          }
        }
        this.emit('response', {
          channel,
          data: res,
        });
      } else {
        this.emit<object, object>('push', {
          channel,
          data: msg as WebSocketPush<object, object>,
        });
      }
    }
  }

  /**
   * Send message to certain channel
   * @param key Key of the channel
   * @param message Message content
   */
  public send(key: WebSocketChannelKey, message: string | object) {
    const msg = typeof message !== 'string' ? JSON.stringify(message) : message;

    if (this._clients[key].readyState === WebSocket.OPEN) {
      this._clients[key].send(msg);
    } else {
      this._clients[key].on('open', () => {
        this._clients[key].send(msg);
      });
    }
  }

  public async privateChannelReady(): Promise<boolean> {
    if (this._authorized) {
      return true;
    } else {
      const p = new Promise<boolean>(resolve => {
        this.on('authorized', () => {
          resolve(true);
        });
      });
      return p;
    }
  }

  private static _instance: OkxWebSocketClient;
  static getInstance(opts: Options): OkxWebSocketClient {
    if (!this._instance) {
      this._instance = new OkxWebSocketClient(opts);
    }
    return this._instance;
  }
}
