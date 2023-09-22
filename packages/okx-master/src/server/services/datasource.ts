import path from 'path';

// eslint-disable-next-line import/order
import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { Order, Trader, User } from '../model';

export const createDataSource = (sqliteDbPath: string): DataSource => {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: sqliteDbPath,
    entities: [Order, Trader, User],
    synchronize: true,
  });
  return dataSource;
};

export const dataSource = createDataSource(
  path.resolve(process.cwd(), 'database/okx.db')
);
