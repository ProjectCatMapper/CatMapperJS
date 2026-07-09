import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';

describe('ProtectedRoute', () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.clearAllMocks();
  });

  const renderRoute = async () => {
    await act(async () => {
      root.render(
        React.createElement(
          MemoryRouter,
          { initialEntries: ['/sociomap/admin'] },
          React.createElement(
            Routes,
            null,
            React.createElement(Route, {
              path: '/:database/admin',
              element: React.createElement(
                ProtectedRoute,
                { requiredLevel: 1 },
                React.createElement('div', { 'data-testid': 'admin' }, 'Admin')
              ),
            }),
            React.createElement(Route, {
              path: '/:database/login',
              element: React.createElement('div', { 'data-testid': 'login' }, 'Login'),
            })
          )
        )
      );
    });
  };

  it('redirects when auth level is stale but no token is available', async () => {
    useAuth.mockReturnValue({ authLevel: 2, cred: null });

    await renderRoute();

    expect(container.querySelector('[data-testid="login"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="admin"]')).toBeFalsy();
  });

  it('renders the protected screen when level and token are present', async () => {
    useAuth.mockReturnValue({ authLevel: 1, cred: 'token-123' });

    await renderRoute();

    expect(container.querySelector('[data-testid="admin"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="login"]')).toBeFalsy();
  });
});
