const existingEnv =
  typeof globalThis.process === 'object' &&
  globalThis.process &&
  typeof globalThis.process.env === 'object'
    ? globalThis.process.env
    : {};

const runtimeEnv = { ...existingEnv };
for (const [key, value] of Object.entries(import.meta.env)) {
  if (key.startsWith('REACT_APP_') || key.startsWith('VITE_')) {
    runtimeEnv[key] = value;
  }
}

if (!runtimeEnv.REACT_APP_API_URL && runtimeEnv.VITE_API_URL) {
  runtimeEnv.REACT_APP_API_URL = runtimeEnv.VITE_API_URL;
}
if (!runtimeEnv.REACT_APP_GOOGLE_ANALYTICS_ID && runtimeEnv.VITE_GOOGLE_ANALYTICS_ID) {
  runtimeEnv.REACT_APP_GOOGLE_ANALYTICS_ID = runtimeEnv.VITE_GOOGLE_ANALYTICS_ID;
}

globalThis.process = {
  ...(typeof globalThis.process === 'object' && globalThis.process ? globalThis.process : {}),
  env: runtimeEnv,
};

import('./index');
