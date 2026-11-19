import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Searchbar from './ExploreSearch';

vi.mock('@mui/material', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    Tooltip: ({ title, children }) => React.createElement(React.Fragment, null, children, title),
  };
});

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
          json: async () => [
            { domain: 'AREA', subdomains: ['AREA', 'ADM0', 'ADM1'] },
            { domain: 'OBJECT', subdomains: ['OBJECT', 'TOOL'] },
          ],
        });
      }

      if (requestUrl.includes('/getDomains/')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { domain: 'AREA', subdomain: 'AREA', description: 'Geographical area' },
            { domain: 'AREA', subdomain: 'ADM0', description: 'Country' },
            { domain: 'AREA', subdomain: 'ADM1', description: 'First-level district' },
            { domain: 'OBJECT', subdomain: 'OBJECT', description: 'Object' },
            { domain: 'OBJECT', subdomain: 'TOOL', description: 'A tool' },
          ],
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

  it('shows descriptions for every subdomain of the selected category domain', async () => {
    await act(async () => {
      root.render(React.createElement(MemoryRouter, null, React.createElement(Searchbar, { database: 'sociomap' })));
      await flushPromises();
    });

    const advancedButton = Array.from(container.querySelectorAll('button')).find(
      button => button.textContent.includes('Advanced Search')
    );
    await act(async () => {
      advancedButton.click();
      await flushPromises();
    });

    const domainSelect = Array.from(container.querySelectorAll('select')).find(
      select => Array.from(select.options).some(option => option.value === 'AREA') &&
        Array.from(select.options).some(option => option.value === 'OBJECT')
    );
    const changeDomain = async (domain) => {
      await act(async () => {
        domainSelect.value = domain;
        domainSelect.dispatchEvent(new Event('change', { bubbles: true }));
        await flushPromises();
      });
    };
    const subdomainTable = () => Array.from(container.querySelectorAll('h3'))
      .find(heading => heading.textContent.includes('category sub-domain'))
      .parentElement.querySelector('tbody');

    await changeDomain('AREA');
    expect(subdomainTable().textContent).toContain('AREA');
    expect(subdomainTable().textContent).toContain('ADM0Country');
    expect(subdomainTable().textContent).toContain('ADM1First-level district');
    expect(subdomainTable().textContent).not.toContain('TOOL');

    await changeDomain('OBJECT');
    expect(subdomainTable().textContent).toContain('TOOLA tool');
    expect(subdomainTable().textContent).not.toContain('ADM1');
  });
});
