import Router from '@koa/router';
import passport from 'koa-passport';

export const routerLogin = new Router({
  prefix: '/api',
});

routerLogin.post(
  '/login/password',
  passport.authenticate('local', {
    successRedirect: '/',
    failureMessage: 'User does not exist or Email and Password are not matched',
  })
);
