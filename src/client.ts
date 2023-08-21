import { HmacSHA256, enc } from 'crypto-js';
import WebSocket from 'ws';

import { URL_WEBSOCKET, WebSocketChannelKey } from './constant';

export interface Options {
  apiKey: string;
  passphrase: string;
  secretKey: string;
}
export class OkxWebSocketClient {
  /**
   * WebSocket clients for different channels
   */
  private _clients: Record<WebSocketChannelKey, WebSocket>;

  private _apiKey: string;
  private _passphrase: string;
  private _secretKey: string;

  /**
   * @deprecated use `OkxWebSocket.getInstance` instead to ensure the application will use the same clients all the time.
   */
  constructor(options: Options) {
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
    key: WebSocketChannelKey,
    message: WebSocket.RawData,
    isBinary: boolean
  ) {
    if (!isBinary) {
      console.log(key, message.toString());
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

  private static _instance: OkxWebSocketClient;
  static getInstance(opts: Options): OkxWebSocketClient {
    if (!this._instance) {
      this._instance = new OkxWebSocketClient(opts);
    }
    return this._instance;
  }
}
