import { Context, Next } from 'koa';

export const auth = () => async (ctx: Context, next: Next) => {
  await next();
};
