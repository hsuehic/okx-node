import { WsChannel } from './type/meta';

export type WsKey = 'private' | 'public' | 'business';

export const WS_BASE_URL = {
  prod: 'wss://ws.okx.com:8443/ws/v5/',
  aws: 'wss://wsaws.okx.com:8443/ws/v5/',
  demo: 'wss://wspap.okx.com:8443/ws/v5/',
} as const;

export type WsMarket = keyof typeof WS_BASE_URL;

export const getWsUrl = (market: WsMarket, key: WsKey): string => {
  const url = `${WS_BASE_URL[market]}${key}${
    market === 'demo' ? '?brokerId=9999' : ''
  }`;
  return url;
};

/** Used to automatically determine if a sub request should be to the public or private ws (when there's two) */
export const PRIVATE_CHANNELS = [
  'account',
  'positions',
  'balance_and_position',
  'orders',
  'orders-algo',
  'algo-advance',
  'liquidation-warning',
  'account-greeks',
  'grid-orders-spot',
  'grid-orders-contract',
  'grid-orders-moon',
  'grid-positions',
  'grid-sub-orders',
];

/**
 * The following channels only support the new business wss endpoint:
 * https://www.okx.com/help-center/changes-to-v5-api-websocket-subscription-parameter-and-url
 */
export const BUSINESS_CHANNELS = [
  'orders-algo',
  'algo-advance',
  'deposit-info',
  'withdrawal-info',
  'grid-orders-spot',
  'grid-orders-contract',
  'grid-orders-moon',
  'grid-positions',
  'grid-sub-orders',
  'algo-recurring-buy',
  'candle1Y',
  'candle6M',
  'candle3M',
  'candle1M',
  'candle1W',
  'candle1D',
  'candle2D',
  'candle3D',
  'candle5D',
  'candle12H',
  'candle6H',
  'candle4H',
  'candle2H',
  'candle1H',
  'candle30m',
  'candle15m',
  'candle5m',
  'candle3m',
  'candle1m',
  'candle1Yutc',
  'candle3Mutc',
  'candle1Mutc',
  'candle1Wutc',
  'candle1Dutc',
  'candle2Dutc',
  'candle3Dutc',
  'candle5Dutc',
  'candle12Hutc',
  'candle6Hutc',
  'mark-price-candle1Y',
  'mark-price-candle6M',
  'mark-price-candle3M',
  'mark-price-candle1M',
  'mark-price-candle1W',
  'mark-price-candle1D',
  'mark-price-candle2D',
  'mark-price-candle3D',
  'mark-price-candle5D',
  'mark-price-candle12H',
  'mark-price-candle6H',
  'mark-price-candle4H',
  'mark-price-candle2H',
  'mark-price-candle1H',
  'mark-price-candle30m',
  'mark-price-candle15m',
  'mark-price-candle5m',
  'mark-price-candle3m',
  'mark-price-candle1m',
  'mark-price-candle1Yutc',
  'mark-price-candle3Mutc',
  'mark-price-candle1Mutc',
  'mark-price-candle1Wutc',
  'mark-price-candle1Dutc',
  'mark-price-candle2Dutc',
  'mark-price-candle3Dutc',
  'mark-price-candle5Dutc',
  'mark-price-candle12Hutc',
  'mark-price-candle6Hutc',
  'index-candle1Y',
  'index-candle6M',
  'index-candle3M',
  'index-candle1M',
  'index-candle1W',
  'index-candle1D',
  'index-candle2D',
  'index-candle3D',
  'index-candle5D',
  'index-candle12H',
  'index-candle6H',
  'index-candle4H index -candle2H',
  'index-candle1H',
  'index-candle30m',
  'index-candle15m',
  'index-candle5m',
  'index-candle3m',
  'index-candle1m',
  'index-candle1Yutc',
  'index-candle3Mutc',
  'index-candle1Mutc',
  'index-candle1Wutc',
  'index-candle1Dutc',
  'index-candle2Dutc',
  'index-candle3Dutc',
  'index-candle5Dutc',
  'index-candle12Hutc',
  'index-candle6Hutc',
];

/**
 * Get ws key for a certain channel
 * @param channel Get ws key for a certain channel
 * @returns {WsKey}
 */
export const getWsKeyForTopicChannel = (channel: WsChannel): WsKey => {
  if (BUSINESS_CHANNELS.includes(channel)) {
    return 'business';
  } else if (PRIVATE_CHANNELS.includes(channel)) {
    return 'private';
  } else {
    return 'public';
  }
};

/**
 * deep match 2 objects
 * @param object1 {object}
 * @param object2 {object}
 * @returns whether the 2 object is deeply match or not
 */
export function deepObjectMatch(object1: object, object2: object): boolean {
  if (typeof object2 !== typeof object1) {
    return false;
  }

  const keys1 = Object.keys(object1).sort();
  const keys2 = Object.keys(object2).sort();

  const hasSameKeyCount = keys1.length === keys2.length;
  if (!hasSameKeyCount) {
    return false;
  }

  const hasSameKeyNames = keys1.every((val, i) => val === keys2[i]);
  if (!hasSameKeyNames) {
    return false;
  }

  for (const key in object1) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const value1 = object1[key];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const value2 = object2[key];

    if (typeof value1 === 'object' && typeof value2 === 'object') {
      if (!deepObjectMatch(value1 as object, value2 as object)) {
        return false;
      }
    }

    if (value1 !== value2) {
      return false;
    }
  }
  return true;
}

/**
 * find deep matched object in iterator, return the object if found, otherwise return undefined.
 * @param arr iterator
 * @param obj object
 * @returns deep matched object in the iterator
 */
export const deepObjectMatchInArr = (
  arr: Iterable<object>,
  obj: object
): object | undefined => {
  for (const o of arr) {
    if (deepObjectMatch(o, obj)) {
      return o;
    }
  }
  return undefined;
};
