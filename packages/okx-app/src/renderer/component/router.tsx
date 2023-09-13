import { createHashRouter } from 'react-router-dom';

import { App } from './App';
import { routes } from './routes';

export const router = createHashRouter([
  {
    element: <App />,
    children: routes,
  },
]);
