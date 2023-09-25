import { User } from '../src/server/model';
import { dataSource } from '../src/server/services';

const initDataSource = async () => {
  await dataSource.initialize();
};

const initUser = async () => {
  const user = new User();
  user.email = 'xiaoweihsueh@gmail.com';
  user.name = 'Xiaowei';
  user.password = 'Abc123!@#';
  const u = await dataSource.manager.save(user);
  console.log(u);
};

const init = async () => {
  await initDataSource();
  await initUser();
};

void init();
