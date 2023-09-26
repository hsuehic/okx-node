import { AccountBalance, AccountPosition } from 'okx-node';

import { get } from './request';

export const getBalance = async (): Promise<AccountBalance> => {
  const url = '/api/v5/account/balance';
  const result = (await get<AccountBalance>(url))[0];
  return result;
};

export const getPositions = async (): Promise<AccountPosition[]> => {
  const url = '/api/v5/account/positions';
  const result = await get<AccountPosition>(url);
  return result;
};
