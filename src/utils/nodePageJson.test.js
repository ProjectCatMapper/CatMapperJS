import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  buildNodePageJsonUrl,
  downloadJsonObject,
  fetchNodePageJson,
} from './nodePageJson';

describe('nodePageJson', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('builds the canonical node-page JSON endpoint URL', () => {
    expect(buildNodePageJsonUrl('https://catmapper.org/api/', 'ArchaMap', 'AM1')).toBe(
      'https://catmapper.org/api/entity/ArchaMap/AM1.json'
    );
  });

  it('fetches the aggregated node-page JSON payload', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ cmid: 'AM1', version: '1.0' }),
    });

    await expect(
      fetchNodePageJson({
        apiBase: 'https://catmapper.org/api',
        database: 'ArchaMap',
        cmid: 'AM1',
        fetchImpl,
      })
    ).resolves.toEqual({ cmid: 'AM1', version: '1.0' });

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://catmapper.org/api/entity/ArchaMap/AM1.json',
      { signal: undefined }
    );
  });

  it('downloads JSON as a file with the requested filename', () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    const appendChild = vi.spyOn(document.body, 'appendChild');
    const removeChild = vi.spyOn(document.body, 'removeChild');

    const originalCreateElement = document.createElement.bind(document);
    const anchor = originalCreateElement('a');
    const click = vi.spyOn(anchor, 'click').mockImplementation(() => {});
    const createElement = vi.spyOn(document, 'createElement').mockImplementation((tagName) => (
      tagName === 'a' ? anchor : originalCreateElement(tagName)
    ));

    downloadJsonObject({ cmid: 'AM1' }, 'AM1.json');

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(appendChild).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(removeChild).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test');

    createElement.mockRestore();
  });
});
