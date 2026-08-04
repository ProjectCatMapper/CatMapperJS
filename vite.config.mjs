import { defineConfig, loadEnv, transformWithOxc } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { resolve } from 'node:path';

const jsAsJsxPlugin = () => ({
  name: 'catmapper-js-as-jsx',
  enforce: 'pre',
  async transform(code, id) {
    const [filepath] = id.split('?');
    if (!filepath.includes('/src/') || !filepath.endsWith('.js')) {
      return null;
    }

    const result = await transformWithOxc(code, id, {
      lang: 'jsx',
      jsx: {
        runtime: 'automatic',
        development: this.environment?.mode !== 'build',
      },
    });

    return {
      code: result.code,
      map: result.map,
    };
  },
});

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isExcelAddin = mode.startsWith('excel-addin');
  const isExcelAddinDev = command === 'serve' && isExcelAddin;
  const defineEnv = {
    'process.env.NODE_ENV': JSON.stringify(command === 'build' ? 'production' : 'development'),
  };

  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith('REACT_APP_') || key.startsWith('VITE_')) {
      defineEnv[`process.env.${key}`] = JSON.stringify(value);
    }
  }

  return {
    cacheDir: process.env.VITE_CACHE_DIR || '/tmp/catmapperjs-vite-cache',
    plugins: [
      ...(isExcelAddinDev ? [basicSsl()] : []),
      jsAsJsxPlugin(),
      react({
        include: /\.(js|jsx|ts|tsx)$/,
      }),
    ],
    envPrefix: ['VITE_', 'REACT_APP_'],
    define: defineEnv,
    optimizeDeps: {
      rolldownOptions: {
        moduleTypes: { '.js': 'jsx' },
      },
    },
    resolve: {
      alias: [
        {
          find: /^vis-data$/,
          replacement: resolve(process.cwd(), 'node_modules/vis-data/esnext/esm/vis-data.js'),
        },
        {
          find: /^vis-network$/,
          replacement: resolve(process.cwd(), 'node_modules/vis-network/esnext/esm/vis-network.js'),
        },
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
    server: {
      host: true,
      port: isExcelAddinDev ? 3001 : 3000,
      allowedHosts: ['dev.catmapper.org', 'catmapperjs-dev'],
      ...(isExcelAddinDev
        ? {
            proxy: {
              '/api': {
                target: 'https://api.catmapper.org',
                changeOrigin: true,
                secure: true,
              },
            },
          }
        : {}),
    },
    preview: {
      host: true,
      port: 3000,
    },
    build: {
      // Route-level lazy loading keeps the initial app shell small. The
      // remaining large chunks are lazy, route-local data/export modules.
      chunkSizeWarningLimit: 4000,
      rolldownOptions: {
        input: {
          main: resolve(process.cwd(), 'index.html'),
          excelAddin: resolve(process.cwd(), 'excel-addin.html'),
        },
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
