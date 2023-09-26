import Router from '@koa/router';

import { okxRestClient } from '../clients';

import { wrapData } from './util';

export const routerAccount = new Router({
  prefix: '/api/v5',
});

routerAccount.get('/account/balance', async ctx => {
  const { ccy } = ctx.query;
  const response = await okxRestClient.getBalance(ccy as string | undefined);
  ctx.body = wrapData(response);
});

routerAccount.get('/account/positions', async ctx => {
  const response = await okxRestClient.getPositions({ ...ctx.request.query });
  ctx.body = wrapData(response);
});
