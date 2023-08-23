/* eslint-disable cnp/only-import-export */
import { createRoot } from 'react-dom/client';

import { App } from './component/App';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
