import Koa, { Context } from 'koa';
import route from 'koa-route';

const app = new Koa();

const port = 8080;

app.use(
  route.get('/', ctx => {
    ctx.body = 'Hello world';
  })
);

app.use(
  route.get('/hello', (ctx: Context) => {
    ctx.body = 'Hello world!';
  })
);

app.use(
  route.get('/trades/:instId', (ctx: Context, instId: string) => {
    ctx.body = instId;
  })
);

app.listen(port, () => {
  console.log(`Server listenning at ${port}`);
});
