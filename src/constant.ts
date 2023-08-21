export const URL_REST = 'https://www.okx.com';
export const URL_WEBSOCKET = {
  public: 'wss://ws.okx.com:8443/ws/v5/public',
  private: 'wss://ws.okx.com:8443/ws/v5/private',
  business: 'wss://ws.okx.com:8443/ws/v5/business',
} as const;

export type WebSocketChannelKey = keyof typeof URL_WEBSOCKET;

export const URL_WSA_REST = 'https://aws.okx.com';

export const URL_WEBSOCKET_WSA = {
  public: 'wss://wsaws.okx.com:8443/ws/v5/public',
  private: 'wss://wsaws.okx.com:8443/ws/v5/private',
  business: 'wss://wsaws.okx.com:8443/ws/v5/business',
} as const;
