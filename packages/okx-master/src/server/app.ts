// import * as path from 'path';

import bodyParser from '@koa/bodyparser';
import cors from '@koa/cors';
import Koa from 'koa';
import passport from 'koa-passport';
import session from 'koa-session';
// import server from 'koa-static';

import { auth, browserRouter } from './middleware';
import {
  routerAccount,
  routerLogin,
  routerOrder,
  routerTrader,
} from './router';

const app = new Koa();
app.use(cors());
app.keys = ['abc', '123'];
app.use(session(app));
app.use(bodyParser());

app.use(passport.initialize());
app.use(passport.session());
// app.use(
//   server(path.resolve(process.cwd(), './static'), {
//     index: 'index.htm', // set to an unexisted file to make it to go through the auth and browserRouter middleware
//   })
// );
app.use(auth());
app.use(routerLogin.routes()).use(routerLogin.allowedMethods());
app.use(routerAccount.routes()).use(routerAccount.allowedMethods());
app.use(routerTrader.routes()).use(routerTrader.allowedMethods());
app.use(routerOrder.routes()).use(routerOrder.allowedMethods());
if (process.env.NODE_ENV !== 'dev') {
  app.use(browserRouter());
}

export { app };
