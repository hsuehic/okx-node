import { OkxTraderItem } from '../../../server/type';

import { get, post } from './request';

interface TraderQuery {
  instId?: string;
  status?: -1 | 0 | 1;
}
export const getTraders = async (query?: TraderQuery) => {
  const result = await get<OkxTraderItem[]>(
    '/api/traders',
    query as Record<string, unknown> | undefined
  );
  return result;
};

export type CreateTraderResponse = { id: string };
export const createTrader = async (
  config: OkxTraderConfigType
): Promise<CreateTraderResponse> => {
  const result = await post<CreateTraderResponse>('/api/traders', config);
  return result;
};

export const getTraderDetail = async (id: string) => {
  const result = await get(`/api/traders/${id}`);
  return result;
};

export const updateTrader = async (
  id: string,
  status: 'running' | 'stopped' | 'removed'
) => {
  const result = await post(`/api/traders/${id}`, { status });
  return result;
};
