/// <reference types="vitest" />

import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  server: {
    port: 3010,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './testSetup',
  },
});
