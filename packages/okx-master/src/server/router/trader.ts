import Router from '@koa/router';

import { OkxTraderMaster, TraderConfig } from '../TraderMaster';

const okxTraderMaster = new OkxTraderMaster();

export const routerTrader = new Router({
  prefix: '/traders',
});

routerTrader.get('/', ctx => {
  const { traders } = okxTraderMaster;
  ctx.response.type = 'application/json';
  ctx.body = {
    msg: '',
    error: 0,
    data: traders.map(trader => {
      const { instId, type, config } = trader;
      return {
        instId,
        type,
        config,
      };
    }),
  };
});

routerTrader.post('/', ctx => {
  const traderConfig = ctx.request.body as TraderConfig;
  const id = okxTraderMaster.addTrader(traderConfig);

  ctx.body = {
    msg: '',
    error: 0,
    data: {
      id,
    },
  };
});

routerTrader.get('/:id', ctx => {
  const id = ctx.params.id;
  const trader = okxTraderMaster.getById(id);
  if (trader) {
    const { config, pendingOrders, filledOrders } = trader;
    ctx.body = {
      msg: '',
      error: 0,
      data: {
        id,
        config,
        pendingOrders,
        filledOrders,
      },
    };
  } else {
    ctx.body = {
      msg: `Trader #${id} doesn't exist.`,
      error: 1,
    };
  }
});

routerTrader.del('/:id', ctx => {
  const id = ctx.params.id;
  const deleted = okxTraderMaster.removeTrader(id);
  ctx.body = {
    msg: '',
    error: 0,
    data: {
      success: deleted,
    },
  };
});
