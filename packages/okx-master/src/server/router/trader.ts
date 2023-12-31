import Router from '@koa/router';

import { okxTraderMaster } from '../instance';

import { wrapData } from './util';

export const routerTrader = new Router({
  prefix: '/api/traders',
});

routerTrader.get('/', ctx => {
  const { traders } = okxTraderMaster;
  const { instId } = ctx.query;
  const filteredTraders = instId
    ? traders.filter(trader => trader.instId === instId)
    : traders;
  ctx.response.type = 'application/json';
  ctx.body = wrapData(
    filteredTraders.map(trader => {
      const {
        instId,
        id,
        type,
        status,
        name,
        config,
        pendingOrders,
        filledOrders,
        boughtPrice,
        boughtSize,
        soldPrice,
        soldSize,
        tradedPrice,
        tradedSize,
      } = trader;
      return {
        config,
        id,
        instId,
        type,
        filledOrders,
        pendingOrders,
        name,
        status,
        boughtPrice,
        boughtSize,
        soldPrice,
        soldSize,
        tradedPrice,
        tradedSize,
      };
    })
  );
});

routerTrader.post('/', ctx => {
  const traderConfig = ctx.request.body as OkxTraderConfigType;
  const id = okxTraderMaster.addTrader(traderConfig);

  ctx.body = wrapData({
    id,
  });
});

routerTrader.get('/:id', ctx => {
  const id = ctx.params.id;
  const trader = okxTraderMaster.getById(id);
  if (trader) {
    const { config, pendingOrders, filledOrders } = trader;
    ctx.body = wrapData({
      id,
      config,
      pendingOrders,
      filledOrders,
    });
  } else {
    ctx.body = {
      msg: `Trader #${id} doesn't exist.`,
      code: '6001',
    };
  }
});

routerTrader.post('/:id', ctx => {
  const id = ctx.params.id;
  const { status } = ctx.request.body as { status: TraderStatus };
  const okxTrader = okxTraderMaster.getById(id);
  switch (status) {
    case 'removed':
      okxTraderMaster.removeTrader(id);
      break;
    case 'running':
      okxTrader?.start();
      break;
    case 'stopped':
      okxTrader?.stop();
      break;
    default:
      break;
  }
  ctx.body = wrapData({
    id,
  });
});
