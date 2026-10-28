import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Admin, { getChangeReviewDetails } from './Admin';

vi.mock('./AuthContext', () => ({
  useAuth: () => ({ authLevel: 2, cred: 'test-token', user: '7' }),
}));
vi.mock('./FooterLinks', () => ({ default: () => React.createElement('div') }));
vi.mock('./SavedCmidInsertPopover', () => ({ default: () => React.createElement('div') }));
vi.mock('@mui/x-data-grid', () => ({
  DataGrid: () => React.createElement('div'), GridToolbar: () => React.createElement('div'),
}));

const flush = async () => { await Promise.resolve(); await Promise.resolve(); };
const preview = (cycles = true) => ({
  keep: { CMID: 'SM280929', CMName: 'Mecca', primaryDomain: 'AREA' },
  discard: { CMID: 'SM14109', CMName: 'Suehn Mecca District', primaryDomain: 'AREA' },
  cyclicParentReferences: cycles ? [{ property: 'parent', datasetID: 'SD11' }] : [],
  cyclicParentToken: 'fresh-preview-token',
});

let root, container, mergePreview;
const clickText = async (text) => {
  const matches = item => item.textContent.trim().toLowerCase() === text.toLowerCase();
  const label = [...document.querySelectorAll('span')].find(matches);
  const node = [...document.querySelectorAll('button, [role="button"]')].find(matches)
    || label?.closest('button, [role="button"]');
  expect(node, text).toBeTruthy();
  await act(async () => { node.click(); await flush(); });
};
const setInput = async (name, value) => {
  const input = container.querySelector(`input[name="${name}"]`);
  expect(input).toBeTruthy();
  await act(async () => {
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flush();
  });
};
const openPreview = async () => {
  await act(async () => {
    root.render(React.createElement(MemoryRouter, null, React.createElement(Admin, { database: 'sociomap' })));
    await flush();
  });
  await clickText('Edit Options');
  await clickText('merge nodes');
  await setInput('s1_2', 'SM280929');
  await setInput('s1_3', 'SM14109');
  await clickText('Submit');
};
const edits = () => fetch.mock.calls.filter(([url]) => String(url).endsWith('/admin/edit'));

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  mergePreview = preview();
  window.alert = vi.fn();
  global.fetch = vi.fn(async (url) => ({
    ok: true,
    headers: { get: () => 'application/json' },
    json: async () => String(url).endsWith('/admin/merge-preview') ? mergePreview : {},
  }));
});
afterEach(async () => {
  await act(async () => { root.unmount(); await flush(); });
  container.remove();
  vi.restoreAllMocks();
});

describe('merge parent confirmation', () => {
  it.each([['yes', true], ['no', false]])('requires a choice and sends %s explicitly', async (choice, expected) => {
    await openPreview();
    expect(document.body.textContent).toContain('make a category its own parent');
    const confirm = [...document.querySelectorAll('button')].find(node => node.textContent === 'Confirm Merge');
    expect(confirm.disabled).toBe(true);
    expect(edits()).toHaveLength(0);
    await act(async () => {
      document.querySelector(`input[type="radio"][value="${choice}"]`).click();
      await flush();
    });
    expect(confirm.disabled).toBe(false);
    await clickText('Confirm Merge');
    const input = JSON.parse(edits()[0][1].body).input;
    expect(input).toMatchObject({
      s1_2: 'SM280929', s1_3: 'SM14109', removeCyclicParents: expected,
      cyclicParentToken: 'fresh-preview-token',
    });
  });

  it('does not ask about parents when no cycle would result', async () => {
    mergePreview = preview(false);
    await openPreview();
    expect(document.querySelector('#cyclic-parent-question')).toBeNull();
    await clickText('Confirm Merge');
    expect(edits()).toHaveLength(1);
    expect(JSON.parse(edits()[0][1].body).input.removeCyclicParents).toBeUndefined();
  });

  it('cancel does not submit a merge and a new preview clears the prior choice', async () => {
    await openPreview();
    await act(async () => { document.querySelector('input[value="yes"]').click(); await flush(); });
    await clickText('Cancel');
    expect(edits()).toHaveLength(0);
    await clickText('Submit');
    expect([...document.querySelectorAll('input[type="radio"]')].every(input => !input.checked)).toBe(true);
  });

  it('shows both choices in the review details', () => {
    for (const choice of [true, false]) {
      expect(getChangeReviewDetails({ action: 'merge nodes', input: { removeCyclicParents: choice } }))
        .toContainEqual({ label: 'Remove cyclical parents', value: choice ? 'Yes' : 'No' });
    }
  });
});
