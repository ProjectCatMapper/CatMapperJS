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
    plugins: [
      react({
        include: /\.(js|jsx|ts|tsx)$/,
      }),
    ],
    envPrefix: ['VITE_', 'REACT_APP_'],
    define: defineEnv,
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
    },
    preview: {
      host: true,
      port: 3000,
    },
    build: {
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
