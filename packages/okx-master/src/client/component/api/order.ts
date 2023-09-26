import {
  FillsHistoryRequest,
  OrderFill,
  OrderHistoryRequest,
  OrderListItem,
} from 'okx-node';

import { get } from './request';

export const getPendingOrders = async (
  params: Partial<Omit<OrderHistoryRequest, 'category'>>
): Promise<OrderListItem[]> => {
  const url = '/api/v5/trade/orders-pending';
  const result = await get<OrderListItem>(url, params);
  return result;
};

export const getOrderHistory = async (
  query: FillsHistoryRequest
): Promise<OrderFill[]> => {
  const url = '/api/v5/trade/fills-history';
  const result = await get<OrderFill>(url, query as Record<string, unknown>);
  return result;
};
