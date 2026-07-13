import { describe, expect, test, beforeEach } from 'vitest';
import { apiBaseUrl, apiEndpoints, apiOrigin, apiUrl } from './endpoints';

describe('API endpoint helpers', () => {
  beforeEach(() => {
    process.env.REACT_APP_API_URL = 'https://api.catmapper.org/';
  });

  test('builds canonical /api base without requiring env migration', () => {
    expect(apiOrigin()).toBe('https://api.catmapper.org');
    expect(apiBaseUrl()).toBe('https://api.catmapper.org/api');
  });

  test('does not duplicate /api when the env already includes it', () => {
    process.env.REACT_APP_API_URL = 'https://api.catmapper.org/api/';
    expect(apiOrigin()).toBe('https://api.catmapper.org');
    expect(apiUrl('/search')).toBe('https://api.catmapper.org/api/search');
  });

  test('builds resource-oriented endpoint paths', () => {
    expect(apiUrl(apiEndpoints.nodeDetails('ArchaMap', 'AM1'))).toBe(
      'https://api.catmapper.org/api/databases/ArchaMap/nodes/AM1'
    );
    expect(apiUrl(apiEndpoints.uploadInputNodes())).toBe(
      'https://api.catmapper.org/api/uploads/input-nodes'
    );
    expect(apiUrl(apiEndpoints.polygonGeoJsonApply('token value'))).toBe(
      'https://api.catmapper.org/api/uploads/geojson/polygons/token%20value/apply'
    );
  });
});
