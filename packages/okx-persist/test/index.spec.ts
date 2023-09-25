import * as path from 'path';

import { Order, Trader, createDataSource } from '../src';

describe('index', () => {
  describe('okx-persist', () => {
    it('Datasource can save Trader entities', async () => {
      const dataSource = createDataSource(
        path.resolve(__dirname, '../database/okx.db')
      );
      await dataSource.initialize();

      const trader = new Trader();

      trader.basePx = 19;
      trader.baseSz = 80;
      trader.coefficient = 1;
      trader.gap = 0.06;
      trader.levelCount = 5;
      trader.instId = 'BTC-USDC';
      trader.name = 'sol006';

      await dataSource.manager.save(trader);

      const result = await dataSource.manager.findOneBy(Trader, {
        name: 'sol006',
      });

      expect(result?.name).toMatch(trader.name);

      const order = new Order();
      order.ordId = 'kdk';
      order.instId = 'SOL-USDC';

      await dataSource.manager.save(order);

      const find = await dataSource.manager.findOneBy(Order, {
        ordId: order.ordId,
      });
      expect(find?.instId).toEqual(order.instId);
    });
  });
});
