import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CategoryMergingTiesTable from './CategoryMergingTiesTable';

const rows = [
  {
    stackID: 'S1',
    datasetID: 'D1',
    Key: 'Site == A',
    categoryCMID: 'C1',
    categoryCMName: 'Canonical A',
  },
  {
    stackID: 'S2',
    datasetID: 'D2',
    Key: 'Site == B',
    categoryCMID: 'C2',
    categoryCMName: 'Canonical B',
  },
];

describe('CategoryMergingTiesTable', () => {
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
    });
    container.remove();
    vi.clearAllMocks();
  });

  it('renders compact category merging tie detail rows', async () => {
    await act(async () => {
      root.render(React.createElement(CategoryMergingTiesTable, { rows, filterBy: 'stack' }));
    });

    expect(container.textContent).toContain('Category Merging Ties (2)');
    expect(container.textContent).toContain('S1');
    expect(container.textContent).toContain('D1');
    expect(container.textContent).toContain('Site == A');
    expect(container.textContent).toContain('C1');
    expect(container.textContent).toContain('Canonical A');
  });

  it('does not render a misleading table for empty category merging ties', async () => {
    await act(async () => {
      root.render(React.createElement(CategoryMergingTiesTable, { rows: [], filterBy: 'dataset' }));
    });

    expect(container.textContent).not.toContain('Category Merging Ties');
    expect(container.querySelector('table')).toBeNull();
  });

  it('limits rows initially and expands on request', async () => {
    const manyRows = Array.from({ length: 3 }, (_, index) => ({
      stackID: 'S1',
      datasetID: `D${index + 1}`,
      Key: `Site == ${index + 1}`,
      categoryCMID: `C${index + 1}`,
      categoryCMName: `Canonical ${index + 1}`,
    }));

    await act(async () => {
      root.render(
        React.createElement(CategoryMergingTiesTable, {
          rows: manyRows,
          filterBy: 'dataset',
          initialLimit: 2,
        })
      );
    });

    expect(container.textContent).toContain('Canonical 1');
    expect(container.textContent).toContain('Canonical 2');
    expect(container.textContent).not.toContain('Canonical 3');

    const showAllButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Show all 3 category merging ties'
    );
    expect(showAllButton).toBeTruthy();

    await act(async () => {
      showAllButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('Canonical 3');
  });
});
