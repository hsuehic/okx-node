import bodyParser from '@koa/bodyparser';
import cors from '@koa/cors';
import Koa from 'koa';

import { routerTrader } from './router';

const app = new Koa();
app.use(cors());
app.use(bodyParser());

app.use(routerTrader.routes()).use(routerTrader.allowedMethods());

const port = 8080;

app.listen(port, () => {
  console.log(`Server listenning at ${port}`);
});
