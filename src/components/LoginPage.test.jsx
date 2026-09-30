import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LoginPage from './LoginPage';

vi.mock('./AuthContext', () => ({
  useAuth: () => ({ login: vi.fn() }),
}));

describe('LoginPage password visibility', () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it('toggles the password field visibility with an accessible control', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <LoginPage database="sociomap" />
        </MemoryRouter>
      );
    });

    const passwordInput = container.querySelector('input[type="password"]');
    const showButton = container.querySelector('button[aria-label="Show password"]');
    expect(passwordInput).toBeTruthy();
    expect(showButton).toBeTruthy();

    await act(async () => {
      showButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.querySelector('input[type="text"]')).toBeTruthy();
    expect(container.querySelector('button[aria-label="Hide password"]')).toBeTruthy();

    await act(async () => {
      container.querySelector('button[aria-label="Hide password"]')
        .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.querySelector('input[type="password"]')).toBeTruthy();
  });
});
