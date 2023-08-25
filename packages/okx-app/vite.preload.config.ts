/* eslint-disable import/no-default-export */
import { defineConfig } from 'vite';
import resolve from 'vite-plugin-resolve';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    sourcemap: true,
  },
  resolve: {
    // Some libs that can run in both Web and Node.js, such as `axios`, we need to tell Vite to build them in Node.js.
    browserField: false,
    conditions: ['require'],
    mainFields: ['main'],
  },
  plugins: [
    resolve({
      ws: `export default require('ws')`,
    }),
  ],
});
