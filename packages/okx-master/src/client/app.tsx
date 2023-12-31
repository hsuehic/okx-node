import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { Account, OkxRestClient, OkxWebSocketClient, Order } from 'okx-node';

import { router } from './component/router';

const market = 'prod';

window.wsClient = OkxWebSocketClient.getInstance({
  market,
});

window.restClient = new OkxRestClient(null, market);

window.wsAccount = new Account(window.wsClient);
window.wsOrder = new Order(window.wsClient);

const container = document.getElementById('root');
const root = createRoot(container as Element);
root.render(<RouterProvider router={router} />);
//Don't use stric mode https://stackoverflow.com/questions/60618844/react-hooks-useeffect-is-called-twice-even-if-an-empty-array-is-used-as-an-ar
