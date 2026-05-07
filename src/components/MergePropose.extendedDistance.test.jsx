import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ProposeMerge from './MergePropose';

vi.mock('./AuthContext', () => ({
  useAuth: () => ({ cred: 'test-token', user: '900' }),
}));

vi.mock('./UseMetadata', () => ({
  useMetadata: () => ({ infodata: [] }),
}));

vi.mock('./DownloadDatasetListButton', () => ({
  default: () => React.createElement('button', { type: 'button' }, 'Download list of Datasets'),
}));

vi.mock('./SavedCmidInsertPopover', () => ({
  default: () => React.createElement('div', { 'data-testid': 'saved-cmid-popover' }),
}));

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('Propose Merge extended distance control', () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    process.env.REACT_APP_API_URL = 'http://api.test';

    global.fetch = vi.fn((url) => {
      const requestUrl = String(url);

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

  it('names the extended merge level as LCA distance', async () => {
    await act(async () => {
      root.render(React.createElement(ProposeMerge, { database: 'ArchaMap' }));
      await flushPromises();
    });

    const extendedRadio = Array.from(container.querySelectorAll('input[type="radio"]')).find(
      (input) => input.value === 'Extended'
    );
    expect(extendedRadio).toBeTruthy();

    await act(async () => {
      extendedRadio.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await flushPromises();
    });

    expect(container.textContent).toContain('Choose LCA Distance for Extended Merge');
    expect(container.textContent).toContain('Only match along a direct ancestor chain');

    const infoButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.getAttribute('aria-label')?.includes('maximum allowed LCA distance')
    );
    expect(infoButton?.getAttribute('aria-label')).toContain('dist(x,a) + dist(x,b) + dist(x,c)');

    const ancestorCheckbox = container.querySelector('input[name="ancestorOnly"]');
    expect(ancestorCheckbox).toBeTruthy();
    expect(ancestorCheckbox.checked).toBe(false);

    await act(async () => {
      ancestorCheckbox.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await flushPromises();
    });

    expect(ancestorCheckbox.checked).toBe(true);
  });
});
