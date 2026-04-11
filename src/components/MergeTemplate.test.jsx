import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MergeTemplate from './MergeTemplate';

vi.mock('./AuthContext', () => ({
  useAuth: () => ({ cred: 'test-token', user: '900' }),
}));

vi.mock('./SavedCmidInsertPopover', () => ({
  default: () => React.createElement('div', { 'data-testid': 'saved-cmid-popover' }),
}));

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

const setInputValue = (input, value) => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
};

describe('MergeTemplate branching', () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    process.env.REACT_APP_API_URL = 'http://api.test';
    window.alert = vi.fn();
    window.open = vi.fn();
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
      await flushPromises();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  it('shows DOWNLOAD LINK FILE and keeps syntax controls disabled for templates without variable mappings', async () => {
    global.fetch = vi.fn((url) => {
      const requestUrl = String(url);

      if (requestUrl.includes('/merge/template/summary/archamap/AD957') || requestUrl.includes('/merge/template/summary/ArchaMap/AD957')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            nodeType: 'MERGING',
            stackSummaryTotals: { variableCount: 0 },
            equivalenceTies: [
              {
                stackID: 'AD958',
                datasetID: 'AD354274',
                Key: 'Site == Red Rock House',
                originalCMID: 'AM1',
                originalCMName: 'Original A',
                equivalentCMID: 'AM900',
                equivalentCMName: 'Canonical A',
              },
            ],
          }),
        });
      }

      if (requestUrl.includes('/merge/template/archamap/AD957') || requestUrl.includes('/merge/template/ArchaMap/AD957')) {
        return Promise.resolve({
          ok: true,
          json: async () => ([
            {
              datasetID: 'AD354274',
              datasetName: 'Becoming Hopi - Kivas',
              filePath: '',
              mergingCMName: 'Test Merge',
              mergingCitation: 'Test Citation',
              mergingID: 'AD957',
              mergingShortName: 'TEST',
              stackID: 'AD958',
            },
          ]),
        });
      }

      return Promise.reject(new Error(`Unhandled fetch in test: ${requestUrl}`));
    });

    await act(async () => {
      root.render(React.createElement(MergeTemplate, { database: 'ArchaMap' }));
      await flushPromises();
    });

    const input = container.querySelector('input');
    expect(input).toBeTruthy();

    await act(async () => {
      setInputValue(input, 'AD957');
      await flushPromises();
    });

    const findButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Find Merging Template'
    );
    expect(findButton).toBeTruthy();

    await act(async () => {
      findButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await flushPromises();
      await flushPromises();
    });

    const downloadTemplateButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Download list of Datasets'
    );
    const downloadLinkFileButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'DOWNLOAD LINK FILE'
    );
    const generateButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Generate Merge Files'
    );

    expect(downloadLinkFileButton).toBeTruthy();
    expect(downloadTemplateButton?.disabled).toBe(true);
    expect(generateButton?.disabled).toBe(true);
    expect(container.textContent).toContain('no variable mappings');
  });

  it('keeps the dataset-template download enabled and still shows the link-file button for variable-aware merging templates', async () => {
    global.fetch = vi.fn((url) => {
      const requestUrl = String(url);

      if (requestUrl.includes('/merge/template/summary/sociomap/SD2202') || requestUrl.includes('/merge/template/summary/SocioMap/SD2202')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            nodeType: 'MERGING',
            stackSummaryTotals: { variableCount: 3 },
            equivalenceTies: [{ datasetID: 'SD1' }],
          }),
        });
      }

      if (requestUrl.includes('/merge/template/sociomap/SD2202') || requestUrl.includes('/merge/template/SocioMap/SD2202')) {
        return Promise.resolve({
          ok: true,
          json: async () => ([
            {
              datasetID: 'SD1',
              datasetName: 'Dataset One',
              filePath: '',
              mergingCMName: 'Test Merge',
              mergingCitation: 'Test Citation',
              mergingID: 'SD2202',
              mergingShortName: 'TEST',
              stackID: 'SD2203',
            },
          ]),
        });
      }

      return Promise.reject(new Error(`Unhandled fetch in test: ${requestUrl}`));
    });

    await act(async () => {
      root.render(React.createElement(MergeTemplate, { database: 'SocioMap' }));
      await flushPromises();
    });

    const input = container.querySelector('input');
    expect(input).toBeTruthy();

    await act(async () => {
      setInputValue(input, 'SD2202');
      await flushPromises();
    });

    const findButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Find Merging Template'
    );

    await act(async () => {
      findButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await flushPromises();
      await flushPromises();
    });

    const downloadTemplateButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Download list of Datasets'
    );
    const downloadLinkFileButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'DOWNLOAD LINK FILE'
    );

    expect(downloadTemplateButton?.disabled).toBe(false);
    expect(downloadLinkFileButton).toBeTruthy();
  });
});
