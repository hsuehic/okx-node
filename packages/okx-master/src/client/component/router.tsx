import { Outlet, createBrowserRouter } from 'react-router-dom';

import { App } from './App';
import { appRoutes, loginRoutes } from './routes';

export const router = createBrowserRouter([
  {
    element: <App />,
    children: appRoutes,
  },
  {
    element: <Outlet />,
    children: loginRoutes,
  },
]);
