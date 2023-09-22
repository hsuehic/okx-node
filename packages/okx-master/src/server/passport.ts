import passport from 'koa-passport';
import { Strategy as LocalStrategy } from 'passport-local';

import { User } from './model';
import { dataSource } from './services';

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
  } else {
    return new Error('User not exist or password is incorrect');
  }
};

const fetchUserById = async (id: number) => {
  const user = await dataSource.manager.findOneBy(User, {
    id,
  });
  if (user) {
    return user;
  }
  throw new Error('User not exist');
};

passport.serializeUser<number>((user: Express.User, done: Done<number>) => {
  try {
    const u = user as User;
    done(null, u.id);
  } catch (err) {
    done(err as Error);
  }
});

passport.deserializeUser<number>(
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async (id: number, done: Done): Promise<void> => {
    try {
      const user = await fetchUserById(id);
      done(null, user);
    } catch (err) {
      done(err as Error);
    }
  }
);

passport.use(
  new LocalStrategy((email: string, password: string, done: Done) => {
    fetchUserByEmailAndPassword(email, password)
      .then(user => {
        done(null, user);
      })
      .catch(() => {
        done(null, false);
      });
  })
);
