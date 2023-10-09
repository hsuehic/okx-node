import Router from '@koa/router';
import { Context, Next } from 'koa';
import passport from 'koa-passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';

import { host, isProd } from '../constant';
import { User } from '../model';
import { dataSource } from '../services';

import { wrapData } from './util';

type Done<T = false | undefined | Express.User> = (
  error: Error | null | undefined,
  user?: T
) => void;

//#region password login
const fetchUserByEmailAndPassword = async (email: string, password: string) => {
  const user = await dataSource.manager.findOneBy(User, {
    email,
    password,
  });
  if (user) {
    return user;
  }
  throw new Error('User not exist or password is incorrect');
};

const fetchUserById = async (id: string) => {
  const user = await dataSource.manager.findOneBy(User, {
    id,
  });
  if (user) {
    return user;
  }
  throw new Error('User does not exist');
};

const fetchUserByEmail = async (email?: string): Promise<User> => {
  if (email) {
    const user = await dataSource.manager.findOneBy(User, {
      email,
    });
    if (user) {
      return user;
    }
    throw new Error('User was not registrered');
  }
  throw new Error('Email can not be empty');
};

passport.serializeUser<string>((user: Express.User, done: Done<string>) => {
  try {
    const u = user as User;
    done(null, u.id);
  } catch (err) {
    console.error(err);
    done(err as Error);
  }
});

passport.deserializeUser<string>(
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async (id: string, done: Done): Promise<void> => {
    try {
      const user = await fetchUserById(id);
      done(null, user);
    } catch (err) {
      console.error(err);
      done(err as Error);
    }
  }
);

passport.use(
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
    },
    (email: string, password: string, done: Done) => {
      fetchUserByEmailAndPassword(email, password)
        .then(user => {
          done(null, user);
        })
        .catch(err => {
          console.error(err);
          done(null, false);
        });
    }
  )
);

export const routerLogin = new Router();

routerLogin.post('/api/login/password', async (ctx: Context, next: Next) => {
  const promise = new Promise(resolve => {
    passport.authenticate('local', (err, user: User | false) => {
      console.log(err, user);
      console.log(isProd);
      if (err) {
        const msg = 'Server internal error';
        ctx.body = {
          code: '5001',
          msg,
        };
      } else if (user === false) {
        ctx.body = {
          code: '1',
          msg: "User doesn't exist",
        };
      } else {
        ctx.body = {
          code: '0',
          data: {},
          msg: '',
        };
      }
      resolve(user);
    })(ctx, next);
  });
  const user = await promise;
  if (user) {
    await ctx.login(user);
  }
});
//#region password login

//#region google oauth20
const googleCallbackPath = '/oauth2/redirect/google';
const googleCallbackUrl = `${host}${googleCallbackPath}`;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      callbackURL: googleCallbackUrl,
      state: true,
      scope: ['profile'],
    },
    (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      const email = profile._json.email;
      fetchUserByEmail(email)
        .then(user => {
          done(null, user);
        })
        .catch((err: Error) => {
          done(err, undefined);
        });
    }
  )
);

routerLogin.get('/login/google', passport.authenticate('google'));
routerLogin.get(
  googleCallbackPath,
  passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/login/google',
  })
);
//#endregion google oauth20

//#region github oauth2
const githubCallbackPath = '/oauth2/redirect/github';
const githubCallbackUrl = `https://okx.ihsueh.com${githubCallbackPath}`;
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.OAUTH_GITHUB_CLIENT_ID,
      clientSecret: process.env.OAUTH_GITHUB_CLIENT_SECRET,
      callbackURL: githubCallbackUrl,
    },
    (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      const email = profile._json.email;
      fetchUserByEmail(email)
        .then(user => {
          done(null, user);
        })
        .catch((err: Error) => {
          done(err, undefined);
        });
    }
  )
);
routerLogin.get(
  '/login/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

routerLogin.get(
  githubCallbackPath,
  passport.authenticate('github', {
    successRedirect: '/',
    failureRedirect: '/login/github',
  })
);
//#endregion github oauth

routerLogin.post('/api/logout', async ctx => {
  await ctx.logout();
  ctx.body = wrapData({});
});

// routerLogin.get('/login/facebook', passport.authenticate('facebook'));
// routerLogin.get(
//   '/auth/facebook/callback',
//   passport.authenticate('facebook', {
//     successRedirect: '/',
//     failureRedirect: '/login',
//   })
// );
