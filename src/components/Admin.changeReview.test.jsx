import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Admin from './Admin';

vi.mock('./AuthContext', () => ({
  useAuth: () => ({ authLevel: 2, cred: 'admin-token', user: '1' }),
}));

vi.mock('./FooterLinks', () => ({
  default: () => React.createElement('div'),
}));

vi.mock('./SavedCmidInsertPopover', () => ({
  default: () => React.createElement('div'),
}));

vi.mock('@mui/x-data-grid', () => ({
  DataGrid: () => React.createElement('div'),
  GridToolbar: () => React.createElement('div'),
}));

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('Admin proposed change review', () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    window.alert = vi.fn();
    window.confirm = vi.fn(() => true);
    global.fetch = vi.fn((url, options = {}) => {
      if (String(url).includes('/decision')) {
        const decision = JSON.parse(options.body || '{}').decision;
        return Promise.resolve({
          ok: true,
          json: async () => ({
            message: decision === 'reject'
              ? 'Change rejected and requester notified.'
              : 'Change approved and applied.',
          }),
        });
      }
      if (String(url).includes('/change-review-preferences')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ sociomap: true, archamap: false, deliveryEnabled: false }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          count: 1,
          reviews: [{
            requestId: 'change-123',
            database: 'sociomap',
            action: 'add/edit/delete node property',
            targetCmid: 'SM123',
            submittedBy: '7',
            submitterName: 'review-user',
            submittedAt: '2026-08-26T12:00:00Z',
            authorizationReason: 'User is not authorized',
            input: { s1_1: 'edit', s1_2: 'SM123', s1_3: 'New name', s1_7: 'CMName' },
          }],
        }),
      });
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

  it('shows the database queue and lets an admin approve a proposal', async () => {
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

    expect(document.body.textContent).toContain('1 proposed change is waiting for review in sociomap.');

    const userOptionsLabel = Array.from(container.querySelectorAll('*')).find(
      (node) => node.textContent?.trim().toLowerCase() === 'user options'
    );
    await act(async () => {
      (userOptionsLabel.closest('button') || userOptionsLabel).dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await flushPromises();
    });

    const reviewOptionLabel = Array.from(container.querySelectorAll('*')).find(
      (node) => node.textContent?.trim().toLowerCase() === 'review proposed changes (1)'
    );
    await act(async () => {
      (reviewOptionLabel.closest('button') || reviewOptionLabel).dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await flushPromises();
    });

    expect(document.body.textContent).toContain('review-user');
    expect(document.body.textContent).toContain('SM123');
    expect(document.body.textContent).toContain('New name');
    expect(document.body.textContent).toContain('Node CMID');
    expect(document.body.textContent).toContain('Proposed value');
    expect(document.body.textContent).not.toContain('"s1_1"');
    expect(document.body.textContent).toContain('Review-email delivery is currently paused system-wide.');

    const approveButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Approve'
    );
    await act(async () => {
      approveButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await flushPromises();
      await flushPromises();
    });

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to approve and apply this proposed change?');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/change-reviews/change-123/decision'),
      expect.objectContaining({ method: 'POST', body: expect.stringContaining('"decision":"approve"') })
    );
    expect(window.alert).toHaveBeenCalledWith('Change approved and applied.');

    const rejectButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Reject'
    );
    await act(async () => {
      rejectButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await flushPromises();
    });

    expect(document.body.textContent).toContain('Reject proposed change');
    expect(document.body.textContent).toContain('The requester will be emailed');
    const comment = document.body.querySelector('textarea');
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      setter.call(comment, 'Please provide a source.');
      comment.dispatchEvent(new Event('input', { bubbles: true }));
      await flushPromises();
    });

    const confirmRejection = Array.from(document.body.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Confirm rejection'
    );
    await act(async () => {
      confirmRejection.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await flushPromises();
      await flushPromises();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/change-reviews/change-123/decision'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ decision: 'reject', note: 'Please provide a source.' }),
      })
    );
    expect(window.alert).toHaveBeenCalledWith('Change rejected and requester notified.');
  });
});
