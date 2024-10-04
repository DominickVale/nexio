import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        rollupOptions: {
            output: {
                assetFileNames: 'assets/[name][extname]',
                entryFileNames: 'assets/[name].js'
            }
        }
    },
    esbuild: {
        drop: ['debugger']
    }
});
