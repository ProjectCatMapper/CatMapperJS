import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Admin from './Admin';

vi.mock('./AuthContext', () => ({
  useAuth: () => ({ cred: 'test-token', user: '900' }),
}));

vi.mock('./FooterLinks', () => ({
  default: () => React.createElement('div', { 'data-testid': 'footer-links' }),
}));

vi.mock('./SavedCmidInsertPopover', () => ({
  default: () => React.createElement('div', { 'data-testid': 'saved-cmid-popover' }),
}));

vi.mock('@mui/x-data-grid', () => ({
  DataGrid: () => React.createElement('div', { 'data-testid': 'data-grid' }),
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

describe('Admin change user password flow', () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          users: [
            {
              userid: '42',
              username: 'ada',
              email: 'ada@example.org',
              first: 'Ada',
              last: 'Lovelace',
              database: 'sociomap',
              intendedUse: 'Research',
              access: 'enabled',
              role: 'user',
            },
          ],
        }),
      })
    );
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

  it('shows a submit button and confirmation dialog for admin password changes', async () => {
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

    const changePasswordOptionLabel = Array.from(container.querySelectorAll('*')).find(
      (node) => node.textContent?.trim().toLowerCase() === 'change user password'
    );
    const changePasswordOption =
      changePasswordOptionLabel?.closest('button')
      || changePasswordOptionLabel?.closest('[role="button"]')
      || changePasswordOptionLabel;
    expect(changePasswordOption).toBeTruthy();

    await act(async () => {
      changePasswordOption.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await flushPromises();
    });

    const usernameInput = container.querySelector('input[name="s1_2"]');
    const passwordInput = container.querySelector('input[name="s1_3"]');
    expect(usernameInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    expect(passwordInput.getAttribute('type')).toBe('password');

    const submitButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Submit Password Change'
    );
    expect(submitButton).toBeTruthy();

    await act(async () => {
      setInputValue(usernameInput, 'ada');
      setInputValue(passwordInput, 'new-secret');
      await flushPromises();
    });

    await act(async () => {
      submitButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await flushPromises();
      await flushPromises();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/users/lookup'),
      expect.objectContaining({ method: 'POST' })
    );
    expect(document.body.textContent).toContain('Confirm Password Change');
    expect(document.body.textContent).toContain("Are you sure you want to change this user's password?");
    expect(document.body.textContent).toContain('ada');
  });
});
