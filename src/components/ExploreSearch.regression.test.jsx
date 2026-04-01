import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Searchbar from './ExploreSearch';

vi.mock('./ExploreSearchTable', () => ({
  default: ({ users }) => React.createElement(
    'div',
    { 'data-testid': 'search-results' },
    users.map((user) => user?.CMID).filter(Boolean).join(',')
  ),
}));

vi.mock('./Button', () => ({
  default: ({ onClick, label, type }) => React.createElement(
    'button',
    { type: 'button', onClick },
    label || type || 'button'
  ),
}));

vi.mock('./EditAdvanced', () => ({
  default: () => React.createElement('div', { 'data-testid': 'download-dialog-button' }),
}));

vi.mock('./UseMetadata', () => ({
  useMetadata: () => ({ infodata: [] }),
}));

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('ExploreSearch cached results hydration', () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    sessionStorage.clear();
    localStorage.clear();
    window.scrollTo = vi.fn();

    global.fetch = vi.fn((url) => {
      const requestUrl = String(url);

      if (requestUrl.includes('/metadata/getCountries/')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ name: 'Ghana', code: 'GH' }],
        });
      }

      if (requestUrl.includes('/metadata/subdomains/')) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      }

      if (requestUrl.includes('/metadata/domainDescriptions/')) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      }

      if (requestUrl.includes('/search?')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            data: [{ CMID: 'NEW1', CMName: 'Fresh Result', domain: 'LANGUAGE', country: 'Ghana', matching: 'Yoruba' }],
            count: [{ totalCount: 1, CMID: ['NEW1'] }],
          }),
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

  it('keeps fresh search results instead of restoring stale cached users after qcount changes', async () => {
    sessionStorage.setItem(
      'sociomap_myData',
      JSON.stringify([{ CMID: 'OLD1', CMName: 'Stale Result', domain: 'LANGUAGE', country: 'Old', matching: 'Old' }])
    );

    await act(async () => {
      root.render(
        React.createElement(
          MemoryRouter,
          { initialEntries: ['/sociomap/explore'] },
          React.createElement(Searchbar, { database: 'sociomap' })
        )
      );
      await flushPromises();
    });

    expect(container.querySelector('[data-testid="search-results"]')?.textContent).toContain('OLD1');

    const input = container.querySelector('#myInput');
    expect(input).toBeTruthy();

    await act(async () => {
      input.value = 'Yoruba';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await flushPromises();
    });

    const searchButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'searchOutlined'
    );
    expect(searchButton).toBeTruthy();

    await act(async () => {
      searchButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await flushPromises();
      await flushPromises();
    });

    const renderedResults = container.querySelector('[data-testid="search-results"]')?.textContent || '';
    expect(renderedResults).toContain('NEW1');
    expect(renderedResults).not.toContain('OLD1');
  });
});
