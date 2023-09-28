import { dataSource } from './services';
import { OkxTraderMaster } from './TraderMaster';
import { OkxTraderPersister } from './TraderPersister';

export const okxTraderMaster = new OkxTraderMaster();
export const okxTraderPersister = new OkxTraderPersister(
  okxTraderMaster,
  dataSource
);
