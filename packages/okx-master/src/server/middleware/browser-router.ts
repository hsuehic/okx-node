import { readFile } from 'fs/promises';
import path from 'path';

import { Context, Next } from 'koa';

/**
 * Router to handle unmatch paths(client routers)
 * @param ctx Context
 * @param next Next
 */
export const browserRouter = () => async (ctx: Context, next: Next) => {
  await next();
  const reg =
    /^\/|\/login|logout|register|account(\/\w+)*|market(\/\w+)*|trader(\/\w+)*$/;
  if (reg.test(ctx.path) && ctx.body === undefined) {
    ctx.body = await readFile(path.resolve(process.cwd(), 'static/index.html'));
    ctx.type = 'text/html';
  }
};
