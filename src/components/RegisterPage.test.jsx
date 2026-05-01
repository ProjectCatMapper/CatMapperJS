import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RegisterPage from './RegisterPage';

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

const setInputValue = (input, value) => {
  const proto = input instanceof window.HTMLTextAreaElement
    ? window.HTMLTextAreaElement.prototype
    : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
};

const clickButton = (container, label) => {
  const button = Array.from(container.querySelectorAll('button')).find(
    (node) => node.textContent?.trim() === label
  );
  expect(button).toBeTruthy();
  button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
};

describe('RegisterPage email verification flow', () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
      await flushPromises();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  const renderRegister = async (initialPath = '/sociomap/register') => {
    await act(async () => {
      root.render(
        React.createElement(
          MemoryRouter,
          { initialEntries: [initialPath] },
          React.createElement(
            Routes,
            null,
            React.createElement(Route, {
              path: '/:database/register',
              element: React.createElement(RegisterPage, { database: 'sociomap' }),
            }),
            React.createElement(Route, {
              path: '/:database/register/verify',
              element: React.createElement(RegisterPage, { database: 'sociomap' }),
            })
          )
        )
      );
      await flushPromises();
    });
  };

  it('shows verification UI after registration request succeeds', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          requestId: 'register_123',
          maskedEmail: 'ad***@example.org',
          status: 'email_unverified',
        }),
      })
    );

    await renderRegister();
    const inputs = container.querySelectorAll('input');
    await act(async () => {
      setInputValue(inputs[0], 'Ada');
      setInputValue(inputs[1], 'Lovelace');
      setInputValue(inputs[2], 'ada@example.org');
      setInputValue(inputs[3], 'ada');
      setInputValue(inputs[4], 'secret1');
      setInputValue(inputs[5], 'secret1');
      setInputValue(container.querySelector('textarea'), 'Research use');
      await flushPromises();
    });

    await act(async () => {
      clickButton(container, 'Register');
      await flushPromises();
    });

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/newuser'), expect.objectContaining({ method: 'POST' }));
    expect(document.body.textContent).toContain('Verify your email');
    expect(document.body.textContent).toContain('ad***@example.org');
  });

  it('prefills verification link params and confirms email', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          message: 'Email verified. Your registration is now awaiting admin approval.',
          status: 'pending',
        }),
      })
    );

    await renderRegister('/sociomap/register/verify?email=ada%40example.org&requestId=register_123&code=654321');

    expect(document.body.textContent).toContain('Registration verification link recognized');
    const codeInput = container.querySelector('input');
    expect(codeInput.value).toBe('654321');

    await act(async () => {
      clickButton(container, 'Confirm Email');
      await flushPromises();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/newuser/confirm-email'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"verificationCode":"654321"'),
      })
    );
    expect(document.body.textContent).toContain('awaiting admin approval');
  });
});
