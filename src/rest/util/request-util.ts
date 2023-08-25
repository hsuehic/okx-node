/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Method } from 'axios';

import { APIMarket } from '../type';

export interface RestClientOptions {
  // Default: false. If true, we'll throw errors if any params are undefined
  strict_param_validation?: boolean;

  // Optionally override API protocol + domain
  // e.g 'https://api.bytick.com'
  baseUrl?: string;

  // Default: true. whether to try and post-process request exceptions.
  parse_exceptions?: boolean;
}

export function serializeParams(
  params: object | undefined,
  method: Method,
  strict_validation = false
): string {
  if (!params) {
    return '';
  }

  if (method !== 'GET') {
    return JSON.stringify(params);
  }

  const queryString = Object.keys(params)
    .map(key => {
      const value = params[key];
      if (strict_validation === true && typeof value === 'undefined') {
        throw new Error(
          'Failed to sign API request due to undefined parameter'
        );
      }
      return `${key}=${value}`;
    })
    .join('&');

  // Prevent trailing `?` if no params are provided
  return queryString ? '?' + queryString : queryString;
}
export const programKey = 'tag';
export const programId = '159881cb7207BCDE';

export function isWsPong(response: any) {
  if (response.pong || response.ping) {
    return true;
  }
  return (
    response.request &&
    response.request.op === 'ping' &&
    response.ret_msg === 'pong' &&
    response.success === true
  );
}
export function getRestBaseUrl(
  market: APIMarket,
  restClientOptions: RestClientOptions
) {
  if (restClientOptions.baseUrl) {
    return restClientOptions.baseUrl;
  }

  switch (market) {
    default:
    case 'demo':
    case 'prod': {
      return 'https://www.okx.com';
    }
    case 'aws': {
      return 'https://aws.okex.com';
    }
  }
}
