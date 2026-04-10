import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MergeLayout from './Merge';

vi.mock('./MergePropose', () => ({
  default: () => React.createElement('div', { 'data-testid': 'merge-propose' }, 'Propose Merge Panel'),
}));

vi.mock('./MergeJoinDatasets', () => ({
  default: () => React.createElement('div', { 'data-testid': 'merge-join' }, 'Join Datasets Panel'),
}));

vi.mock('./MergeTemplate', () => ({
  default: () => React.createElement('div', { 'data-testid': 'merge-template' }, 'Download Merge Template Panel'),
}));

vi.mock('./FooterLinks', () => ({
  default: () => React.createElement('div', { 'data-testid': 'footer-links' }),
}));

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

const MergeHarness = () => {
  const params = useParams();
  return React.createElement(MergeLayout, params);
};

const LocationProbe = () => {
  const location = useLocation();
  return React.createElement('div', { 'data-testid': 'location-probe' }, location.pathname);
};

describe('Merge tab routing', () => {
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

  const renderAt = async (initialEntry) => {
    await act(async () => {
      root.render(
        React.createElement(
          MemoryRouter,
          { initialEntries: [initialEntry] },
          React.createElement(
            React.Fragment,
            null,
            React.createElement(LocationProbe),
            React.createElement(
              Routes,
              null,
              React.createElement(Route, {
                path: '/:database/merge',
                element: React.createElement(MergeHarness),
              }),
              React.createElement(Route, {
                path: '/:database/merge/:tab',
                element: React.createElement(MergeHarness),
              })
            )
          )
        )
      );
      await flushPromises();
    });
  };

  it('restores the download merge template tab from the URL', async () => {
    await renderAt('/sociomap/merge/download-merge-template');

    expect(container.querySelector('[data-testid="merge-template"]')?.textContent).toContain('Download Merge Template Panel');
    expect(container.querySelector('[data-testid="location-probe"]')?.textContent).toBe('/sociomap/merge/download-merge-template');
  });

  it('redirects the base merge route to the default merge tab', async () => {
    await renderAt('/sociomap/merge');

    expect(container.querySelector('[data-testid="merge-propose"]')?.textContent).toContain('Propose Merge Panel');
    expect(container.querySelector('[data-testid="location-probe"]')?.textContent).toBe('/sociomap/merge/propose-merge');
  });

  it('updates the URL when the active merge tab changes', async () => {
    await renderAt('/sociomap/merge/propose-merge');

    const tabButton = Array.from(container.querySelectorAll('[role="tab"]')).find(
      (node) => node.textContent?.trim() === 'Download merge template'
    );
    expect(tabButton).toBeTruthy();

    await act(async () => {
      tabButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await flushPromises();
    });

    expect(container.querySelector('[data-testid="merge-template"]')?.textContent).toContain('Download Merge Template Panel');
    expect(container.querySelector('[data-testid="location-probe"]')?.textContent).toBe('/sociomap/merge/download-merge-template');
  });
});
