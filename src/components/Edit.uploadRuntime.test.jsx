import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const parseTabularFileMock = vi.fn();
const authMock = vi.hoisted(() => ({ authLevel: 2 }));

vi.mock('../utils/tabularUpload', () => ({
  parseTabularFile: (...args) => parseTabularFileMock(...args),
}));

vi.mock('./AuthContext', () => ({
  useAuth: () => ({
    user: 'tester',
    cred: 'token',
    authLevel: authMock.authLevel,
  }),
}));

vi.mock('./DatasetCreate', () => ({
  default: () => React.createElement('div', { 'data-testid': 'dataset-create' }),
}));

vi.mock('./SavedCmidInsertPopover', () => ({
  default: () => React.createElement('div', { 'data-testid': 'saved-cmid-popover' }),
}));

vi.mock('./PolygonGeoJsonUpload', () => ({
  default: () => React.createElement('div', { 'data-testid': 'polygon-geojson-upload' }),
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
    authMock.authLevel = 2;

    parseTabularFileMock.mockReset();
    vi.mocked(editUploadApi.uploadInputNodes).mockReset();
    vi.mocked(editUploadApi.getUploadInputNodesStatus).mockReset();
    vi.mocked(editUploadApi.getWaitingUSESStatus).mockReset();
    vi.mocked(editUploadApi.cancelUploadInputNodes).mockReset();
    vi.mocked(editUploadApi.getUploadProperties).mockReset();
  });

  it('keeps GeoJSON upload in a separate admin tab', async () => {
    authMock.authLevel = 2;
    await renderEdit(root);

    const spreadsheetTab = [...container.querySelectorAll('[role="tab"]')].find(
      (tab) => tab.textContent?.trim() === 'Spreadsheet upload',
    );
    const geoJsonTab = [...container.querySelectorAll('[role="tab"]')].find(
      (tab) => tab.textContent?.trim() === 'GeoJSON polygons',
    );
    expect(spreadsheetTab).toBeTruthy();
    expect(geoJsonTab).toBeTruthy();
    expect(container.querySelector('[data-testid="polygon-geojson-upload"]')).toBeNull();
    expect(container.textContent).toContain('Choose file to import');

    await act(async () => {
      geoJsonTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await flushPromises();
    });

    expect(container.querySelector('[data-testid="polygon-geojson-upload"]')).toBeTruthy();
    expect(container.textContent).not.toContain('Choose file to import');
  });

  it('does not expose the GeoJSON tab to non-admin users', async () => {
    authMock.authLevel = 1;
    await renderEdit(root);
    expect(container.textContent).toContain('Spreadsheet upload');
    expect(container.textContent).not.toContain('GeoJSON polygons');
    expect(container.querySelector('[data-testid="polygon-geojson-upload"]')).toBeNull();
    authMock.authLevel = 2;
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
      headers: ['categoryID', 'stackID', 'comment'],
      rows2d: [['C1', 'S1', 'note']],
      records: [
        {
          categoryID: 'C1',
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

    const errorText = 'Adding or replacing properties for existing category merging ties is not permitted for now.';
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
    const uploadCall = editUploadApi.uploadInputNodes.mock.calls[0][0];
    expect(uploadCall.payload).toHaveProperty('optionalProperties');
    expect(uploadCall.payload).not.toHaveProperty('allContext');

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

  it('alerts upload API warnings returned when the task is queued', async () => {
    parseTabularFileMock.mockResolvedValue({
      headers: ['CMName', 'Name', 'Key', 'label', 'datasetID'],
      rows2d: [['Node A', 'Node A', 'Var == 1==2', 'LANGUOID', 'AD1']],
      records: [
        {
          CMName: 'Node A',
          Name: 'Node A',
          Key: 'Var == 1==2',
          label: 'LANGUOID',
          datasetID: 'AD1',
        },
      ],
    });

    vi.mocked(editUploadApi.uploadInputNodes).mockResolvedValue({
      ok: true,
      json: async () => ({
        taskId: 'task-warning',
        status: 'queued',
        warnings: ['Key row 1: Does the original variable value contain "=="?'],
      }),
    });

    await renderEdit(root);
    await uploadFile(container, 'warning.csv');

    const uploadButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'UPLOAD',
    );
    expect(uploadButton).toBeTruthy();

    await act(async () => {
      uploadButton.click();
      await flushPromises();
    });

    expect(window.alert).toHaveBeenCalledWith(
      'Warning: Key row 1: Does the original variable value contain "=="?',
    );
  });

  it('warns before add-node uploads when the spreadsheet includes CMID', async () => {
    parseTabularFileMock.mockResolvedValue({
      headers: ['CMID', 'CMName', 'Name', 'Key', 'label', 'datasetID'],
      rows2d: [['AM1', 'Node A', 'Node A', 'Var == A', 'LANGUOID', 'AD1']],
      records: [
        {
          CMID: 'AM1',
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
      json: async () => ({ taskId: 'task-cmid-warning', status: 'queued' }),
    });

    await renderEdit(root);
    await uploadFile(container, 'cmid-add-node.csv');

    const uploadButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'UPLOAD',
    );
    expect(uploadButton).toBeTruthy();

    await act(async () => {
      uploadButton.click();
      await flushPromises();
    });

    expect(editUploadApi.uploadInputNodes).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain(
      'You will be creating new nodes, instead of adding uses ties to existing nodes. Do you want to continue?',
    );
    expect(document.body.textContent).toContain('Cancel');
    expect(document.body.textContent).toContain('Continue');

    const continueButton = Array.from(document.body.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Continue',
    );
    expect(continueButton).toBeTruthy();

    await act(async () => {
      continueButton.click();
      await flushPromises();
    });

    expect(editUploadApi.uploadInputNodes).toHaveBeenCalledTimes(1);
  });

  it('requires Key for variable merging uploads', async () => {
    sessionStorage.setItem(
      'catmapper.edit.uploadState.archamap',
      JSON.stringify({
        selectedOption: 'standard',
        advselectedOption: 'add_merging',
      }),
    );

    parseTabularFileMock.mockResolvedValue({
      headers: ['mergingID', 'datasetID', 'variableID', 'varName'],
      rows2d: [['M1', 'AD1', 'V1', 'value_a']],
      records: [
        {
          mergingID: 'M1',
          datasetID: 'AD1',
          variableID: 'V1',
          varName: 'value_a',
        },
      ],
    });

    await renderEdit(root);
    await uploadFile(container, 'variable-merge.csv');

    expect(document.body.textContent).toContain('Missing the following required columns: Key');
  });

  it('shows node and USES replacement uploads to registered users but keeps merging replacement admin-only', async () => {
    authMock.authLevel = 1;

    parseTabularFileMock.mockResolvedValue({
      headers: ['CMID', 'Key', 'datasetID', 'CMName'],
      rows2d: [['AM1', 'Type == A', 'AD1', 'Node A']],
      records: [
        {
          CMID: 'AM1',
          Key: 'Type == A',
          datasetID: 'AD1',
          CMName: 'Node A',
        },
      ],
    });

    await renderEdit(root);
    await uploadFile(container, 'owned-replace.csv');

    expect(container.querySelector('input[value="node_replace"]')).toBeTruthy();
    expect(container.querySelector('input[value="update_replace"]')).toBeTruthy();
    expect(container.querySelector('input[value="merging_replace"]')).toBeFalsy();
  });

  it('does not treat Name as CMName for dataset node uploads', async () => {
    parseTabularFileMock.mockResolvedValue({
      headers: ['Name', 'label', 'shortName', 'DatasetCitation'],
      rows2d: [['Dataset A', 'DATASET', 'Dataset A', 'Citation A']],
      records: [
        {
          Name: 'Dataset A',
          label: 'DATASET',
          shortName: 'Dataset A',
          DatasetCitation: 'Citation A',
        },
      ],
    });

    await renderEdit(root);
    await uploadFile(container, 'dataset-without-cmname.csv');

    expect(document.body.textContent).toContain('Missing the following required columns: CMName');

    const cmNameRequiredLabel = Array.from(container.querySelectorAll('label')).find(
      (label) => label.textContent?.trim() === 'CMName',
    );
    expect(cmNameRequiredLabel).toBeTruthy();
    expect(cmNameRequiredLabel.querySelector('input')?.checked).toBe(false);

    const uploadButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'UPLOAD',
    );
    expect(uploadButton).toBeTruthy();
    expect(uploadButton.disabled).toBe(true);
  });
});
