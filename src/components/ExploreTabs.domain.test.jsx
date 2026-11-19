import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import ClickTable from './ExploreTabs';

let gridProps;
vi.mock('@mui/x-data-grid', () => ({
  DataGrid: (props) => { gridProps = props; return null; },
  GridToolbar: () => null,
}));
vi.mock('@mui/material/useMediaQuery', () => ({ default: () => false }));

afterEach(() => { gridProps = undefined; });

it('keeps the domain hidden by default and allows users to show its row value', async () => {
  const container = document.createElement('div');
  const root = createRoot(container);
  await act(async () => {
    root.render(<ClickTable usert={[{ Source: 'Example', Domain: 'ETHNICITY, LANGUAGE' }]} />);
  });
  expect(gridProps.columns.find((column) => column.field === 'domain').headerName).toBe('Domain');
  expect(gridProps.rows[0].domain).toBe('ETHNICITY, LANGUAGE');
  expect(gridProps.columnVisibilityModel.domain).toBe(false);
  await act(async () => {
    gridProps.onColumnVisibilityModelChange({ ...gridProps.columnVisibilityModel, domain: true });
  });
  expect(gridProps.columnVisibilityModel.domain).toBe(true);
  await act(async () => root.unmount());
});
