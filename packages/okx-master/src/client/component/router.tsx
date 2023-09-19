import { Outlet, createHashRouter } from 'react-router-dom';

import { App } from './App';
import { appRoutes, loginRoutes } from './routes';

export const router = createHashRouter([
  {
    element: <App />,
    children: appRoutes,
  },
  {
    element: <Outlet />,
    children: loginRoutes,
  },
]);
