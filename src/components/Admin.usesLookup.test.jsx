import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Admin from './Admin';

vi.mock('./AuthContext', () => ({
  useAuth: () => ({ authLevel: 2, cred: 'test-token', user: '900' }),
}));

vi.mock('./FooterLinks', () => ({ default: () => React.createElement('div') }));
vi.mock('./SavedCmidInsertPopover', () => ({ default: () => React.createElement('div') }));
vi.mock('@mui/x-data-grid', () => ({ DataGrid: () => React.createElement('div') }));

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

describe('Admin USES tie lookup', () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    window.alert = vi.fn();
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
      await flushPromises();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  it('ignores an older CMID lookup response after a newer lookup completes', async () => {
    const pending = [];
    global.fetch = vi.fn((url) => {
      if (!String(url).includes('/admin_add_edit_delete_usesproperties')) {
        return Promise.resolve({ json: async () => ({}) });
      }
      return new Promise((resolve) => pending.push({ url: String(url), resolve }));
    });

    await act(async () => {
      root.render(
        React.createElement(
          MemoryRouter,
          { initialEntries: ['/sociomap/admin'] },
          React.createElement(Admin, { database: 'sociomap' })
        )
      );
      await flushPromises();
    });

    const cmidInput = container.querySelector('input[name="s1_2"]');
    await act(async () => {
      setInputValue(cmidInput, 'SM111');
      await flushPromises();
    });
    await act(async () => {
      setInputValue(cmidInput, 'SM222');
      await flushPromises();
    });

    const oldRequest = pending.find(({ url }) => url.includes('CMID=SM111'));
    const currentRequest = pending.find(({ url }) => url.includes('CMID=SM222'));
    expect(oldRequest).toBeTruthy();
    expect(currentRequest).toBeTruthy();

    const tieFor = (cmid, name) => [[
      { CMID: cmid, CMName: name },
      { id: `rel-${cmid}`, Key: 'key-1' },
      { CMID: 'SD1', CMName: 'Dataset one' },
    ]];

    await act(async () => {
      currentRequest.resolve({
        json: async () => ({ r: tieFor('SM222', 'Current category'), r1: ['parent'] }),
      });
      await flushPromises();
    });
    await act(async () => {
      oldRequest.resolve({
        json: async () => ({ r: tieFor('SM111', 'Stale category'), r1: ['parent'] }),
      });
      await flushPromises();
    });

    const tieSelect = container.querySelector('[role="combobox"]');
    expect(tieSelect).toBeTruthy();
    await act(async () => {
      tieSelect.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      await flushPromises();
    });

    expect(document.body.textContent).toContain('Current category ---- USES Key: key-1');
    expect(document.body.textContent).not.toContain('Stale category ---- USES Key: key-1');
    expect(window.alert).not.toHaveBeenCalled();
  });
});
