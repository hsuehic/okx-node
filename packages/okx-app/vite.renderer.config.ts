/* eslint-disable import/no-default-export */
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [react({ include: /\.(scss|mdx|js|jsx|ts|tsx)$/ })],
});
