// eslint-disable-next-line import/order
import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { Order, Trader } from './entity';

export const createDataSource = (sqliteDbPath: string): DataSource => {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: sqliteDbPath,
    entities: [Order, Trader],
    synchronize: true,
  });
  return dataSource;
};
