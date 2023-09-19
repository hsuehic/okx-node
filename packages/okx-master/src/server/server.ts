import * as path from 'path';

import bodyParser from '@koa/bodyparser';
import cors from '@koa/cors';
import Koa from 'koa';
import server from 'koa-static';

import { routerTrader } from './router';

const app = new Koa();
app.use(cors());
app.use(bodyParser());

app.use(routerTrader.routes()).use(routerTrader.allowedMethods());

app.use(server(path.resolve(__dirname, './static')));

const port = 80;

app.listen(port, () => {
  console.log(`Server listenning at ${port}`);
});
