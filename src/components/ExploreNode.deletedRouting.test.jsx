import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Tableclick from './ExploreNode';

vi.mock('./UseMetadata', () => ({
  useMetadata: () => ({ infodata: [] }),
}));

vi.mock('./AuthContext', () => ({
  useAuth: () => ({ user: null, cred: null }),
}));

const ExploreNodeHarness = () => {
  const params = useParams();
  return React.createElement(Tableclick, params);
};

const LocationProbe = () => {
  const location = useLocation();
  return React.createElement(
    'div',
    { 'data-testid': 'location-probe' },
    `${location.pathname}${location.search}`
  );
};

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
};

describe('deleted node routing', () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    global.fetch = vi.fn((url) => {
      const requestUrl = String(url);

      if (requestUrl.includes('/info/sociomap/SM20483')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            CMID: 'SM20483',
            CMName: 'Yin',
            Domains: ['DELETED'],
            Merged_into_CMID: 'SM496603',
          }),
        });
      }

      if (requestUrl.includes('/category/sociomap/SM20483')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            categories: [],
            childcategories: [],
            relnames: [],
            samples: [],
          }),
        });
      }

      if (requestUrl.includes('/exploreGeometry/sociomap/SM20483')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            badsources: [],
            datasetpoints: [],
            points: [],
            polygons: [],
          }),
        });
      }

      if (requestUrl.includes('/databases/sociomap/nodes/SM20483/map-layer-options')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ layers: [], limits: {} }),
        });
      }

      if (
        requestUrl.includes('/metadata/subdomains/sociomap') ||
        requestUrl.includes('/metadata/domainDescriptions/sociomap')
      ) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      }

      return Promise.reject(new Error(`Unhandled fetch in test: ${requestUrl}`));
    });
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
      await flushPromises();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  it('renders the deleted node in place with an explicit replacement link', async () => {
    await act(async () => {
      root.render(
        React.createElement(
          MemoryRouter,
          { initialEntries: ['/sociomap/SM20483'] },
          React.createElement(
            React.Fragment,
            null,
            React.createElement(LocationProbe),
            React.createElement(
              Routes,
              null,
              React.createElement(Route, {
                path: '/:database/:cmid',
                element: React.createElement(ExploreNodeHarness),
              })
            )
          )
        )
      );
      await flushPromises();
      await flushPromises();
    });

    expect(container.querySelector('[data-testid="location-probe"]')?.textContent)
      .toBe('/sociomap/SM20483');
    expect(container.textContent).toContain('CatMapper ID: SM20483');
    expect(container.textContent).toContain('Domain: DELETED');
    expect(container.textContent).toContain('This deleted node is linked to active CMID SM496603.');
    expect(container.textContent).toContain('Go to Active CMID');
  });
});
