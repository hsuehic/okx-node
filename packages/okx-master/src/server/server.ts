import { app } from './app';
import { dataSource } from './services';

const init = async () => {
  // Initialize database connection before starting the http server
  await dataSource.initialize();
  const port = 8080;
  app.listen(port, () => {
    console.log(`Server is listenning on port #${port}`);
  });
};

void init();
