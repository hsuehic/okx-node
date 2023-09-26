import Router from '@koa/router';

import { okxRestClient } from '../clients';

import { wrapData } from './util';

export const routerOrder = new Router({
  prefix: '/api/v5',
});

routerOrder.get('/trade/orders-pending', async ctx => {
  const response = await okxRestClient.getOrderList({ ...ctx.query });
  ctx.body = wrapData(response);
});

routerOrder.get('/trade/order', async ctx => {
  const instId = '';
  const response = await okxRestClient.getOrderDetails({
    instId,
    ...ctx.request.query,
  });
  ctx.body = wrapData(response);
});

routerOrder.get('/trade/fills-history', async ctx => {
  const response = await okxRestClient.getFillsHistory({ ...ctx.query });
  ctx.body = wrapData(response);
});
