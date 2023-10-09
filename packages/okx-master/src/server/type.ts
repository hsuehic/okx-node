import { WsOrder } from 'okx-node';

export interface OkxTraderItem {
  id: string;
  name: string;
  type: TraderType;
  status: TraderStatus;
  config: OkxTraderConfigType;
  pendingOrders: WsOrder[];
  filledOrders: WsOrder[];
  boughtSize: number;
  boughtPrice: number;
  soldSize: number;
  soldPrice: number;
  tradedSize: number;
  tradedPrice: number;
}
