import { defineConfig } from 'vite';
import * as path        from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, './src/CameraController.js'),
      fileName: format => `camera-controller.${ format }.js`,
      name: 'CameraController'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});