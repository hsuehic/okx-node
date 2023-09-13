import { OkxTraderConfig } from './Trader';

export interface OkxDiffTraderConfig extends OkxTraderConfig {
  type: 'diff';
  maximunOrders: number;
}
