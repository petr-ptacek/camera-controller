import { defineConfig } from 'vite';
import * as path        from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, './TestMonitor.js'),
      fileName: format => `TestMonitor.${ format }.js`,
      name: 'TestMonitor'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});