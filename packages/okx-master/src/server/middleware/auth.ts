import { Context, Next } from 'koa';

export const auth = () => async (ctx: Context, next: Next) => {
  if (ctx.isAuthenticated()) {
    await next();
  } else {
    if (/^\/api\//.test(ctx.request.path)) {
      // protect apis
      const publicApis = ['/api/login/password', '/api/logout'];
      if (!publicApis.includes(ctx.request.path)) {
        ctx.body = {
          error: 1,
          msg: 'Anthentication needed',
        };
        ctx.throw(401);
      }
    } else {
      // protect pages
      const reg =
        /^\/(trade(\/[^/]+)*|account(\/[^/]+)*|order(\/[^/]+)*|order(\/[^/]+)*)*$/;
      if (reg.test(ctx.request.path)) {
        ctx.redirect('/login');
        return;
      }
    }
    await next();
  }
};
