import { apiBaseUrl } from '../api/endpoints';

const POLL_INTERVAL_MS = 1000;

const sleep = (milliseconds, signal) => new Promise((resolve, reject) => {
  const finish = () => {
    signal?.removeEventListener('abort', abort);
    resolve();
  };
  const timeout = setTimeout(finish, milliseconds);
  const abort = () => {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
    reject(new DOMException('The request was canceled.', 'AbortError'));
  };

  if (signal?.aborted) {
    abort();
    return;
  }
  signal?.addEventListener('abort', abort, { once: true });
});

const readResponse = async (response) => {
  const text = await response.text();
  let body = {};
  if (text) {
    try {
      body = JSON.parse(text);
    } catch (_error) {
      body = { error: text };
    }
  }

  if (!response.ok) {
    const error = new Error(body?.error || body?.message || `CatMapper returned HTTP ${response.status}.`);
    error.status = response.status;
    error.payload = body;
    throw error;
  }
  return body;
};

const postJson = async (path, body, signal) => {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  return readResponse(response);
};

export const fetchTranslationDomains = async (database, signal) => {
  const response = await fetch(
    `${apiBaseUrl()}/getTranslatedomains?database=${encodeURIComponent(database)}`,
    { signal }
  );
  const body = await readResponse(response);
  return Array.isArray(body) ? body : [];
};

export const startTranslation = (payload, signal) =>
  postJson('/translate/start', payload, signal);

export const cancelTranslation = async (taskId) => {
  if (!taskId) return null;
  return postJson('/translate/cancel', { taskId });
};

export const pollTranslation = async (
  taskId,
  { signal, onProgress, pollIntervalMs = POLL_INTERVAL_MS } = {}
) => {
  while (true) {
    if (signal?.aborted) {
      throw new DOMException('The request was canceled.', 'AbortError');
    }

    const task = await postJson('/translate/status', { taskId }, signal);
    onProgress?.(task);
    const status = String(task?.status || '').toLowerCase();

    if (status === 'completed') return task;
    if (status === 'failed') {
      throw new Error(task?.error || 'CatMapper translation failed.');
    }
    if (status === 'canceled') {
      throw new DOMException('The translation was canceled.', 'AbortError');
    }
    if (status !== 'processing') {
      throw new Error(`CatMapper returned an unexpected task status: ${status || '(missing)'}.`);
    }

    await sleep(pollIntervalMs, signal);
  }
};

export { readResponse };
