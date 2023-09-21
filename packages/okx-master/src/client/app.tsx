import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { Account, OkxRestClient, OkxWebSocketClient, Order } from 'okx-node';

import { router } from './component/router';

const apiKey = 'b2cc9da8-6fab-436e-9eef-c3a43fdd7ffe';
const passphrase = '!Xue78361251234';
const secretKey = 'BD6E01CE1ADD146548C26884EF6E898F';
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
