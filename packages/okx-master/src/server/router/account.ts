import Router from '@koa/router';

import { okxRestClient } from '../clients';

export const routerAccount = new Router({
  prefix: '/api/v5',
});

routerAccount.get('/account/balance', async ctx => {
  const { ccy } = ctx.query;
  const response = await okxRestClient.getBalance(ccy as string);
  ctx.body = response;
});
