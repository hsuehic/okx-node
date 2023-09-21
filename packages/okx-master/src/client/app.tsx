import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { Account, OkxRestClient, OkxWebSocketClient, Order } from 'okx-node';

import { router } from './component/router';

const apiKey = '7fd283b1-cc12-4d5a-a691-5c96416ac13a';
const passphrase = '123ABC!@#abc';
const secretKey = 'AFD0FAE5D4F73373CBD906F2A5B9C440';
const market = 'demo';

window.wsClient = OkxWebSocketClient.getInstance({
  apiKey,
  passphrase,
  secretKey,
  market,
});

window.restClient = new OkxRestClient(
  {
    apiKey,
    apiPass: passphrase,
    apiSecret: secretKey,
  },
  market
);

window.wsAccount = new Account(window.wsClient);
window.wsOrder = new Order(window.wsClient);

const container = document.getElementById('root');
const root = createRoot(container as Element);
root.render(<RouterProvider router={router} />);
//Don't use stric mode https://stackoverflow.com/questions/60618844/react-hooks-useeffect-is-called-twice-even-if-an-empty-array-is-used-as-an-ar
