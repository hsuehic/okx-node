/* eslint-disable import/no-default-export */
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ command, mode }) => {
  console.log(command, mode);
  return {
    build: {
      sourcemap: true,
      outDir: 'static',
    },
    plugins: [react({ include: /\.(scss|mdx|js|jsx|ts|tsx)$/ })],
  };
});
