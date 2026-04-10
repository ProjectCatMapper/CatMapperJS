import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-ga4', () => ({
  default: {
    send: vi.fn(),
  },
}));

vi.mock('./components/CookieBanner', () => ({
  default: () => React.createElement('div', { 'data-testid': 'cookie-banner' }),
}));

vi.mock('./utils/cookieConsent', () => ({
  isCookieConsentAccepted: () => false,
}));

vi.mock('./routes/Catmapper', async () => {
  await Promise.resolve();
  return {
    default: () => React.createElement('div', { 'data-testid': 'landing-route' }, 'Landing Route'),
  };
});

vi.mock('./routes/Explore', async () => {
  await Promise.resolve();
  return {
    default: () => React.createElement('div', { 'data-testid': 'explore-route' }, 'Explore Route'),
  };
});

vi.mock('./routes/ForgotPassword', async () => {
  await Promise.resolve();
  return {
    default: () => React.createElement('div', { 'data-testid': 'forgot-password-route' }, 'Forgot Password Route'),
  };
});

import App from './App';

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

const waitForRoute = async (selector, expectedText) => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await act(async () => {
      await flushPromises();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const textContent = document.querySelector(selector)?.textContent || '';
    if (textContent.includes(expectedText)) {
      return;
    }
  }

  throw new Error(`Timed out waiting for ${selector} to include "${expectedText}"`);
};

describe('App lazy-loaded routes', () => {
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
    vi.clearAllMocks();
  });

  const renderAt = async (initialEntries) => {
    await act(async () => {
      root.render(
        React.createElement(
          MemoryRouter,
          { initialEntries },
          React.createElement(App)
        )
      );
      await flushPromises();
    });
  };

  it('renders the landing route through the suspense boundary', async () => {
    await renderAt(['/']);

    expect(container.querySelector('[data-testid="cookie-banner"]')).toBeTruthy();
    await waitForRoute('[data-testid="landing-route"]', 'Landing Route');
  });

  it('renders database explore routes after lazy loading', async () => {
    await renderAt(['/sociomap/explore']);

    await waitForRoute('[data-testid="explore-route"]', 'Explore Route');
  });

  it('keeps forgot-password redirect behavior unchanged', async () => {
    await renderAt(['/forgot-password']);

    await waitForRoute('[data-testid="forgot-password-route"]', 'Forgot Password Route');
  });
});
