import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// One fixed address (http://localhost:5173) matters: the account/data live in localStorage, which the browser
// keeps separately for every origin (localhost vs 127.0.0.1 vs 192.168.x.x vs VS Code's preview are all different).
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { host: 'localhost', port: 5173, strictPort: true, open: true },
  preview: { host: 'localhost', port: 4173, strictPort: true }
});
