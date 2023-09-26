import { post } from './request';

export const login = async (username: string, password: string) => {
  const result = await post('/api/login/password', {
    username,
    password,
  });
  return result;
};

export const logout = async () => {
  await post('/api/logout');
};
