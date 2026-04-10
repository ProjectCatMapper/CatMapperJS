import { describe, expect, it, vi } from 'vitest';
import { fetchMapGroupData, mapTupleRowsToPoints } from './mapGroupData';

describe('mapGroupData', () => {
  it('converts tuple rows into point objects', () => {
    expect(
      mapTupleRowsToPoints([
        ['SM1', '10.2', '11.3', 'Yoruba'],
        ['SM2', '-1', '5', 'Akan'],
      ])
    ).toEqual([
      { CMID: 'SM1', long: '10.2', lat: '11.3', CMName: 'Yoruba' },
      { CMID: 'SM2', long: '-1', lat: '5', CMName: 'Akan' },
    ]);
  });

  it('ignores malformed rows and fetches public assets', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        ['SM1', '10.2', '11.3', 'Yoruba'],
        ['broken'],
      ],
    });

    await expect(fetchMapGroupData('/map-data/sociomap-language.min.json', fetchImpl)).resolves.toEqual([
      { CMID: 'SM1', long: '10.2', lat: '11.3', CMName: 'Yoruba' },
    ]);
    expect(fetchImpl).toHaveBeenCalledWith('/map-data/sociomap-language.min.json');
  });
});
