import Router from '@koa/router';
import { Context, Next } from 'koa';
import passport from 'koa-passport';
import { Strategy as LocalStrategy } from 'passport-local';

import { User } from '../model';
import { dataSource } from '../services';

type Done<T = false | undefined | Express.User> = (
  error: Error | null | undefined,
  user?: T
) => void;

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
  throw new Error('User not exist');
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

export const routerLogin = new Router({
  prefix: '/api',
});

routerLogin.post('/login/password', async (ctx: Context, next: Next) => {
  const promise = new Promise(resolve => {
    passport.authenticate('local', (err, user: User | false) => {
      console.log(err, user);
      if (err) {
        const msg = 'Server internal error';
        ctx.body = {
          err: 5001,
          msg,
        };
      } else if (user === false) {
        ctx.body = {
          err: 1,
          msg: "User doesn't exist",
        };
      } else {
        ctx.body = {
          err: 0,
          data: {},
        };
      }
      resolve(user);
    })(ctx, next);
  });
  await promise;
});
