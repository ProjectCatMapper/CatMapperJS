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

import * as editUploadApi from '../api/editUploadApi';
import Edit from './Edit';

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

const renderEdit = async (root) => {
  await act(async () => {
    root.render(React.createElement(Edit, { database: 'archamap' }));
    await flushPromises();
  });
};

const uploadFile = async (container, fileName = 'upload.csv') => {
  const input = container.querySelector('#fileInput');
  expect(input).toBeTruthy();

  const file = new File(['placeholder'], fileName, { type: 'text/csv' });
  Object.defineProperty(input, 'files', {
    configurable: true,
    value: [file],
  });

  await act(async () => {
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flushPromises();
  });
};

describe('Edit upload runtime', () => {
  let container;
  let root;
  let fetchMock;

  beforeEach(() => {
    vi.useRealTimers();

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    sessionStorage.clear();

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

    parseTabularFileMock.mockReset();
    vi.mocked(editUploadApi.uploadInputNodes).mockReset();
    vi.mocked(editUploadApi.getUploadInputNodesStatus).mockReset();
    vi.mocked(editUploadApi.getWaitingUSESStatus).mockReset();
    vi.mocked(editUploadApi.cancelUploadInputNodes).mockReset();
    vi.mocked(editUploadApi.getUploadProperties).mockReset();
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
      await flushPromises();
    });
    container.remove();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('renders a single merge compatibility error and keeps the visible option in sync with state', async () => {
    sessionStorage.setItem(
      'catmapper.edit.uploadState.archamap',
      JSON.stringify({
        selectedOption: 'standard',
        advselectedOption: 'merging_replace',
      }),
    );

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

    await renderEdit(root);
    await uploadFile(container);

    expect(parseTabularFileMock).toHaveBeenCalledTimes(1);

    const mergeReplaceRadio = container.querySelector('input[value="merging_replace"]');
    expect(mergeReplaceRadio?.checked).toBe(true);

    const errorText = 'Adding or replacing proeprties for existing equivalence ties is not permitted for now.';
    expect(document.body.textContent).toContain(errorText);
    expect(document.body.textContent.split(errorText).length - 1).toBe(1);
  });

  it('keeps the upload progress dialog open with completion details until closed', async () => {
    vi.useFakeTimers();

    parseTabularFileMock.mockResolvedValue({
      headers: ['CMName', 'Name', 'Key', 'label', 'datasetID'],
      rows2d: [['Node A', 'Node A', 'Var == A', 'LANGUOID', 'AD1']],
      records: [
        {
          CMName: 'Node A',
          Name: 'Node A',
          Key: 'Var == A',
          label: 'LANGUOID',
          datasetID: 'AD1',
        },
      ],
    });

    vi.mocked(editUploadApi.uploadInputNodes).mockResolvedValue({
      ok: true,
      json: async () => ({ taskId: 'task-1', status: 'queued' }),
    });

    vi.mocked(editUploadApi.getUploadInputNodesStatus).mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'completed',
        message: 'Upload completed successfully.',
        progress: {
          completedBatches: 1,
          totalBatches: 1,
          percent: 100,
        },
        events: ['Finished upload'],
        nextCursor: 1,
        file: [{ CMID: 'AM1' }],
        order: ['CMID'],
      }),
    });

    await renderEdit(root);
    await uploadFile(container, 'complete.csv');

    const uploadButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'UPLOAD',
    );
    expect(uploadButton).toBeTruthy();

    await act(async () => {
      uploadButton.click();
      await flushPromises();
    });

    expect(editUploadApi.uploadInputNodes).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1600);
      await flushPromises();
    });

    expect(editUploadApi.getUploadInputNodesStatus).toHaveBeenCalledTimes(1);

    expect(document.body.textContent).toContain('Upload Completed');
    expect(document.body.textContent).toContain('Upload completed successfully.');
    expect(document.body.textContent).toContain('Batch 1 of 1');
    expect(document.body.textContent).toContain('100% complete');
    expect(document.body.textContent).toContain('Finished upload');
    expect(document.body.textContent).toContain('Close');
  });
});
