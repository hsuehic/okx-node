import Koa from 'koa';
import connect from 'koa-connect';
import { createServer as createViteServer } from 'vite';

import { app } from '../src/server/app';
import { dataSource } from '../src/server/services';

const port = 8080;
async function createServer() {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: true,
    },
  });

  await dataSource.initialize();

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

  app.listen(port, () => {
    console.log(`Server at port #${port}`);
  });
}

void createServer();
