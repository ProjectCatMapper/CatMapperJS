// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cancelTranslation,
  fetchTranslationDomains,
  pollTranslation,
  readResponse,
  startTranslation,
} from './apiClient';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('CatMapper add-in API client', () => {
  it('parses plain-text API errors', async () => {
    const response = new Response('translation failed', { status: 500 });
    await expect(readResponse(response)).rejects.toThrow('translation failed');
  });

  it('loads translation domains', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify([{ group: 'AREA', nodes: ['SITE'] }]), { status: 200 })
    ));
    await expect(fetchTranslationDomains('ArchaMap')).resolves.toEqual([
      { group: 'AREA', nodes: ['SITE'] },
    ]);
  });

  it('starts and polls an asynchronous translation', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ taskId: 'task-1' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        taskId: 'task-1', status: 'processing', percent: 50,
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        taskId: 'task-1', status: 'completed', percent: 100, file: [], order: [],
      }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const start = await startTranslation({ table: [] });
    const progress = vi.fn();
    const result = await pollTranslation(start.taskId, { progress, onProgress: progress, pollIntervalMs: 0 });

    expect(result.status).toBe('completed');
    expect(progress).toHaveBeenCalledTimes(2);
  });

  it('surfaces failed and canceled task states', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 'failed', error: 'bad input' }), { status: 200 })
    ));
    await expect(pollTranslation('failed-task', { pollIntervalMs: 0 })).rejects.toThrow('bad input');

    globalThis.fetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 'canceled' }), { status: 200 })
    );
    await expect(pollTranslation('canceled-task', { pollIntervalMs: 0 })).rejects.toMatchObject({
      name: 'AbortError',
    });
  });

  it('sends task cancellation to CatMapper', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ taskId: 'task-1', status: 'canceled' }), { status: 200 })
    );
    vi.stubGlobal('fetch', fetchMock);
    await cancelTranslation('task-1');
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/translate/cancel'), expect.objectContaining({
      body: JSON.stringify({ taskId: 'task-1' }),
      method: 'POST',
    }));
  });
});
