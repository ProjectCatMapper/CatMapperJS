import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const parseTabularFileMock = vi.fn();

vi.mock('../utils/tabularUpload', () => ({
  parseTabularFile: (...args) => parseTabularFileMock(...args),
}));

vi.mock('./AuthContext', () => ({
  useAuth: () => ({
    user: 'tester',
    cred: 'token',
    authLevel: 2,
  }),
}));

vi.mock('./DatasetCreate', () => ({
  default: () => React.createElement('div', { 'data-testid': 'dataset-create' }),
}));

vi.mock('./SavedCmidInsertPopover', () => ({
  default: () => React.createElement('div', { 'data-testid': 'saved-cmid-popover' }),
}));

vi.mock('../api/editUploadApi', () => ({
  uploadInputNodes: vi.fn(),
  getWaitingUSESStatus: vi.fn(),
  getUploadInputNodesStatus: vi.fn(),
  cancelUploadInputNodes: vi.fn(),
  getUploadProperties: vi.fn(),
}));

import Edit from './Edit';

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('Edit upload runtime', () => {
  let container;
  let root;
  let fetchMock;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    sessionStorage.clear();
    sessionStorage.setItem(
      'catmapper.edit.uploadState.archamap',
      JSON.stringify({
        selectedOption: 'standard',
        advselectedOption: 'merging_replace',
      }),
    );

    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          display: 'Language',
          subdisplay: 'Language',
          subdomain: 'LANGUAGE',
          order: 1,
          suborder: 1,
        },
      ],
    });
    global.fetch = fetchMock;
    window.alert = vi.fn();

    parseTabularFileMock.mockResolvedValue({
      headers: ['categoryID1', 'categoryID2', 'stackID', 'comment'],
      rows2d: [['C1', 'C2', 'S1', 'note']],
      records: [
        {
          categoryID1: 'C1',
          categoryID2: 'C2',
          stackID: 'S1',
          comment: 'note',
        },
      ],
    });
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
      await flushPromises();
    });
    container.remove();
    vi.clearAllMocks();
  });

  it('handles uploaded files without throwing when merging_replace is incompatible', async () => {
    await act(async () => {
      root.render(React.createElement(Edit, { database: 'archamap' }));
      await flushPromises();
    });

    const input = container.querySelector('#fileInput');
    expect(input).toBeTruthy();

    const file = new File(['categoryID1,categoryID2,stackID,comment'], 'upload.csv', {
      type: 'text/csv',
    });

    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [file],
    });

    await act(async () => {
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await flushPromises();
    });

    expect(parseTabularFileMock).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain('Number of nodes to import: 1');
    expect(container.textContent).toContain(
      'Adding or replacing proeprties for existing equivalence ties is not permitted for now.',
    );
  });
});
