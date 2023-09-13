/* eslint-disable import/no-default-export */
import react from '@vitejs/plugin-react';
import { UserConfig } from 'vite';

// https://vitejs.dev/config

export default {
  build: {
    sourcemap: true,
  },
  plugins: [react({ include: /\.(scss|mdx|js|jsx|ts|tsx)$/ })],
} as UserConfig;
