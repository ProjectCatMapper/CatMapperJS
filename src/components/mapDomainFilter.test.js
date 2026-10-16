import { expect, test } from 'vitest';
import { filterMapDomains, getAvailableMapDomains } from './mapDomainFilter';
const point = (label) => ({ sourceNodeLabels: ['CATEGORY', 'AREA', label] });
const layers = [{ points: [point('ADM0'), point('ADM1'), point('LANG')], polygons: {
  type: 'FeatureCollection', features: ['ADM0', 'ADM1'].map((domain) => ({
    type: 'Feature', properties: { sourceNodeLabels: ['AREA', domain] },
  })),
} }];
test('offers domains without AREA or structural labels', () => {
  expect(getAvailableMapDomains(layers)).toEqual(['ADM0', 'ADM1', 'LANG']);
});
test('default selection excludes ADM0 points and polygons', () => {
  const selected = getAvailableMapDomains(layers).filter((d) => d !== 'ADM0');
  const [filtered] = filterMapDomains(layers, selected);
  expect(filtered.points).toEqual([point('ADM1'), point('LANG')]);
  expect(filtered.polygons).toHaveLength(1);
});
test('can select ADM0 or clear every domain', () => {
  expect(filterMapDomains(layers, ['ADM0'])[0].points).toEqual([point('ADM0')]);
  expect(filterMapDomains(layers, [])[0].points).toEqual([]);
  expect(filterMapDomains(layers, [])[0].polygons).toEqual([]);
});
test('uses category domains for direct geometry without labels', () => {
  const direct = [{ points: [{}], polygons: [] }];
  expect(getAvailableMapDomains(direct, ['CATEGORY', 'AREA', 'ADM0'])).toEqual(['ADM0']);
  expect(filterMapDomains(direct, [], ['ADM0'])[0].points).toEqual([]);
});
