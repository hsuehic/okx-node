import Koa from 'koa';
import connect from 'koa-connect';
import { createServer as createViteServer } from 'vite';

import { routerTrader } from '../src/server/router';

const PORT = 8080;
async function createServer() {
  const app = new Koa();

  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: true,
    },
  });

  app.use(routerTrader.routes()).use(routerTrader.allowedMethods());

  app.use(connect(vite.middlewares) as Koa.Middleware);

  app.use(async (ctx, next) => {
    await next();

    if (ctx.type === 'text/html') {
      ctx.body = await vite.transformIndexHtml(
        ctx.request.url,
        ctx.body as string
      );
    }
  });

  app.listen(PORT, () => {
    console.log(`Server at port #${PORT}`);
  });
}

void createServer();
