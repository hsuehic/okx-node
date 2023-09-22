import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { Account, OkxRestClient, OkxWebSocketClient, Order } from 'okx-node';

import { router } from './component/router';

const apiKey = 'ea96d8ce-5f5e-4405-a6ca-b53f951442cc';
const passphrase = '!Xue78361251234';
const secretKey = 'CC8BF0D78B7546A19CAE5CAF2D432BE5';
const market = 'prod';

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
