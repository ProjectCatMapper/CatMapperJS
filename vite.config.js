import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const defineEnv = {
    'process.env.NODE_ENV': JSON.stringify(mode),
  };

  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith('REACT_APP_') || key.startsWith('VITE_')) {
      defineEnv[`process.env.${key}`] = JSON.stringify(value);
    }
  }

  return {
    cacheDir: process.env.VITE_CACHE_DIR || '/tmp/catmapperjs-vite-cache',
    plugins: [
      react({
        include: /\.(js|jsx|ts|tsx)$/,
      }),
    ],
    envPrefix: ['VITE_', 'REACT_APP_'],
    define: defineEnv,
    resolve: {
      alias: [
        { find: /^vis-data$/, replacement: 'vis-data/esnext/esm/vis-data.js' },
        { find: /^vis-network$/, replacement: 'vis-network/esnext/esm/vis-network.js' },
      ],
      dedupe: [
        'react',
        'react-dom',
        '@emotion/react',
        '@emotion/styled',
        '@mui/material',
        '@mui/system',
      ],
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.js$/,
      exclude: [],
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    server: {
      host: true,
      port: 3000,
      allowedHosts: ['dev.catmapper.org', 'catmapperjs-dev'],
    },
    preview: {
      host: true,
      port: 3000,
    },
    build: {
      // Route-level lazy loading keeps the initial app shell small. The
      // remaining large chunks are lazy, route-local data/export modules.
      chunkSizeWarningLimit: 4000,
      rollupOptions: {
        onwarn(warning, warn) {
          const warningText = String(warning?.message || '');
          const isLoadersChildProcessWarning =
            warningText.includes('child-process-proxy.js') &&
            warningText.includes('"spawn" is not exported by "__vite-browser-external"');

          if (isLoadersChildProcessWarning) {
            return;
          }
          warn(warning);
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './vitest.setup.js',
      include: ['src/**/*.test.{js,jsx,ts,tsx}'],
      exclude: ['tests/**', 'node_modules/**'],
    },
  };
});
