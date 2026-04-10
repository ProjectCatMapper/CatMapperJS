import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ProfilePage from './ProfilePage';

vi.mock('./AuthContext', () => ({
  useAuth: () => ({ cred: 'test-token', user: 'tester' }),
}));

const profileApiMocks = vi.hoisted(() => ({
  addBookmark: vi.fn(),
  confirmApiKeyCreation: vi.fn(),
  confirmPasswordChange: vi.fn(),
  confirmProfileUpdate: vi.fn(),
  getBookmarks: vi.fn(),
  getHistory: vi.fn(),
  getUserActivity: vi.fn(),
  getUserProfile: vi.fn(),
  removeBookmarks: vi.fn(),
  requestApiKeyCreation: vi.fn(),
  requestPasswordChange: vi.fn(),
  requestProfileUpdate: vi.fn(),
}));

vi.mock('../api/profileApi', () => profileApiMocks);

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe('ProfilePage async activity loading', () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
      await flushPromises();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  it('renders the profile shell while activity is still loading', async () => {
    const pendingActivity = deferred();

    profileApiMocks.getUserProfile.mockResolvedValue({
      userId: 'tester',
      username: 'tester',
      firstName: 'Test',
      lastName: 'User',
      email: 'tester@example.com',
      database: 'sociomap',
      intendedUse: 'Testing',
      hasApiKey: false,
    });
    profileApiMocks.getUserActivity.mockReturnValue(pendingActivity.promise);
    profileApiMocks.getBookmarks.mockResolvedValue({ bookmarks: [] });
    profileApiMocks.getHistory.mockResolvedValue({ history: [] });

    await act(async () => {
      root.render(
        React.createElement(
          MemoryRouter,
          { initialEntries: ['/sociomap/profile/activity'] },
          React.createElement(ProfilePage, { database: 'sociomap', tab: 'activity' })
        )
      );
      await flushPromises();
      await flushPromises();
    });

    expect(container.textContent).toContain('My Profile');
    expect(container.textContent).toContain('My Activity');
    expect(container.querySelectorAll('[role="progressbar"]').length).toBe(1);

    await act(async () => {
      pendingActivity.resolve({
        createdNodes: 7,
        createdRelationships: 3,
        updatedNodes: 5,
        updatedRelationships: 2,
        totalActions: 17,
      });
      await flushPromises();
      await flushPromises();
    });

    expect(container.querySelector('[role="progressbar"]')).toBeNull();
    expect(container.textContent).toContain('Total Logged Actions');
    expect(container.textContent).toContain('17');
  });
});
