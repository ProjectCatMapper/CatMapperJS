import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Admin from './Admin';

const authMock = vi.hoisted(() => ({ authLevel: 2 }));

vi.mock('./AuthContext', () => ({
  useAuth: () => ({ authLevel: authMock.authLevel, cred: 'test-token', user: '900' }),
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

const setTextareaValue = (textarea, value) => {
  const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(textarea), 'value')?.set;
  setter?.call(textarea, value);
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.dispatchEvent(new Event('change', { bubbles: true }));
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
    authMock.authLevel = 2;
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

    const userOptionsLabel = Array.from(container.querySelectorAll('*')).find(
      (node) => node.textContent?.trim().toLowerCase() === 'user options'
    );
    const userOptionsButton =
      userOptionsLabel?.closest('button')
      || userOptionsLabel?.closest('[role="button"]')
      || userOptionsLabel;
    expect(userOptionsButton).toBeTruthy();

    await act(async () => {
      userOptionsButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
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

  it('shows only owner-scoped edit tools for registered users', async () => {
    authMock.authLevel = 1;

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

    expect(document.body.textContent).toContain('Owner-scoped editing tools');
    expect(document.body.textContent).not.toContain('User Options');
    expect(document.body.textContent).not.toContain('Database Checks');

    const editOptionsLabel = Array.from(container.querySelectorAll('*')).find(
      (node) => node.textContent?.trim().toLowerCase() === 'edit options'
    );
    const editOptionsButton =
      editOptionsLabel?.closest('button')
      || editOptionsLabel?.closest('[role="button"]')
      || editOptionsLabel;
    expect(editOptionsButton).toBeTruthy();

    await act(async () => {
      editOptionsButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await flushPromises();
    });

    expect(document.body.textContent).toContain('add/edit/delete node property');
    expect(document.body.textContent).toContain('merge nodes');
    expect(document.body.textContent).toContain('delete node');
    expect(document.body.textContent).toContain('delete USES relation');
    expect(document.body.textContent).not.toContain('create new user');
  });

  it('alerts registered users when no USES ties are eligible', async () => {
    authMock.authLevel = 1;
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ r: [], r1: ['Key', 'label', 'Name'] }),
      })
    );

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
    expect(cmidInput).toBeTruthy();

    await act(async () => {
      setInputValue(cmidInput, 'SM123');
      await flushPromises();
      await flushPromises();
    });

    expect(window.alert).toHaveBeenCalledWith('No USES ties are eligible for modification for this CMID.');
  });

  it('opens admin review request dialog for blocked registered user node deletion', async () => {
    authMock.authLevel = 1;
    window.confirm = vi.fn(() => true);
    global.fetch = vi.fn((url) => {
      if (String(url).includes('/admin/edit')) {
        return Promise.resolve({
          ok: false,
          headers: { get: () => 'application/json' },
          json: async () => ({
            error: 'User is not authorized to merge or delete SM123; the CMID is referenced in other USES ties: rel-1',
            requiresAdminReview: true,
            review: {
              cmid: 'SM123',
              reasonCode: 'cmid_referenced_elsewhere',
              details: { references: ['rel-1'] },
            },
          }),
        });
      }
      if (String(url).includes('/admin/node-removal-review-request')) {
        return Promise.resolve({
          ok: true,
          headers: { get: () => 'application/json' },
          json: async () => ({ message: 'Admin review request sent.' }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({ r: { CMName: 'Blocked Node' } }),
      });
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

    const editOptionsLabel = Array.from(container.querySelectorAll('*')).find(
      (node) => node.textContent?.trim().toLowerCase() === 'edit options'
    );
    const editOptionsButton =
      editOptionsLabel?.closest('button')
      || editOptionsLabel?.closest('[role="button"]')
      || editOptionsLabel;

    await act(async () => {
      editOptionsButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await flushPromises();
    });

    const deleteNodeLabel = Array.from(container.querySelectorAll('*')).find(
      (node) => node.textContent?.trim().toLowerCase() === 'delete node'
    );
    const deleteNodeOption =
      deleteNodeLabel?.closest('button')
      || deleteNodeLabel?.closest('[role="button"]')
      || deleteNodeLabel;

    await act(async () => {
      deleteNodeOption.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await flushPromises();
    });

    const cmidInput = container.querySelector('input[name="s1_2"]');
    await act(async () => {
      setInputValue(cmidInput, 'SM123');
      await flushPromises();
    });

    const submitButton = Array.from(container.querySelectorAll('button')).find(
      (node) => node.textContent?.trim() === 'Submit'
    );

    await act(async () => {
      submitButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await flushPromises();
      await flushPromises();
    });

    expect(document.body.textContent).toContain('Admin Review Required');
    expect(document.body.textContent).toContain('SM123');

    const reasonInput = document.body.querySelector('textarea');
    await act(async () => {
      setTextareaValue(reasonInput, 'Please merge the duplicate I created by mistake.');
      await flushPromises();
    });

    const sendButton = Array.from(document.body.querySelectorAll('button')).find(
      (node) => node.textContent?.trim() === 'Send Request'
    );

    await act(async () => {
      sendButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await flushPromises();
      await flushPromises();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/node-removal-review-request'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('Please merge the duplicate I created by mistake.'),
      })
    );
    expect(window.alert).toHaveBeenCalledWith('Admin review request sent.');
  });
});
