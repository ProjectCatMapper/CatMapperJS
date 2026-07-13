import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../api/editUploadApi', () => ({
  preflightPolygonGeoJson: vi.fn(),
  applyPolygonGeoJson: vi.fn(),
  discardPolygonGeoJson: vi.fn(),
  getUploadInputNodesStatus: vi.fn(),
  cancelUploadInputNodes: vi.fn(),
}));

import * as api from '../api/editUploadApi';
import PolygonGeoJsonUpload from './PolygonGeoJsonUpload';


const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
};


describe('PolygonGeoJsonUpload', () => {
  let container;
  let root;

  beforeEach(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    vi.mocked(api.preflightPolygonGeoJson).mockReset();
    await act(async () => {
      root.render(<PolygonGeoJsonUpload database="archamap" cred="token" user="admin" />);
      await flush();
    });
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.useRealTimers();
  });

  it('requires a successful preflight before apply is enabled', async () => {
    expect(container.textContent).toContain('one existing USES tie in ArchaMap.');
    expect(container.textContent).not.toContain('one existing USES tie in archamap.');
    const buttons = [...container.querySelectorAll('button')];
    expect(buttons.find((button) => button.textContent.includes('Validate')).disabled).toBe(true);
    expect(buttons.find((button) => button.textContent.includes('Apply')).disabled).toBe(true);

    const input = container.querySelector('input[type="file"]');
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [new File(['{}'], 'polygons.geojson', { type: 'application/geo+json' })],
    });
    await act(async () => {
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await flush();
    });
    expect(buttons.find((button) => button.textContent.includes('Validate')).disabled).toBe(false);
  });

  it('uses the canonical SocioMap capitalization in its instructions', async () => {
    await act(async () => {
      root.render(<PolygonGeoJsonUpload database="sociomap" cred="token" user="admin" />);
      await flush();
    });
    expect(container.textContent).toContain('one existing USES tie in SocioMap.');
    expect(container.textContent).not.toContain('one existing USES tie in sociomap.');
  });

  it('shows structured feature errors from preflight', async () => {
    vi.mocked(api.preflightPolygonGeoJson).mockResolvedValue({
      ok: false,
      json: async () => ({
        error: 'GeoJSON validation failed.',
        error_details: [{ feature: 3, field: 'Key', code: 'invalid_key', message: 'Bad Key' }],
      }),
    });
    const input = container.querySelector('input[type="file"]');
    Object.defineProperty(input, 'files', { configurable: true, value: [new File(['{}'], 'bad.geojson')] });
    await act(async () => {
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await flush();
    });
    const validate = [...container.querySelectorAll('button')].find((button) => button.textContent.includes('Validate'));
    await act(async () => {
      validate.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await flush();
    });
    expect(container.textContent).toContain('GeoJSON validation failed.');
    expect(container.textContent).toContain('Bad Key');
    expect(container.textContent).toContain('3');
  });
});
