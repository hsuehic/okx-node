import * as path from 'path';

import bodyParser from '@koa/bodyparser';
import cors from '@koa/cors';
import Koa from 'koa';
import passport from 'koa-passport';
import session from 'koa-session';
import server from 'koa-static';

/// import { auth } from './middleware';
import { routerAccount, routerTrader } from './router';

const app = new Koa();
app.use(cors());
app.keys = ['abc', '123'];
app.use(session(app));
app.use(bodyParser());

app.use(passport.initialize());
app.use(passport.session());
// app.use(auth());
app.use(routerAccount.routes()).use(routerAccount.allowedMethods());
app.use(routerTrader.routes()).use(routerTrader.allowedMethods());

app.use(server(path.resolve(__dirname, './static')));

export { app };
