import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

async function open(page, path) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' });
}

test.describe('Main app smoke rendering', () => {
  test('landing page renders core hero content', async ({ page }) => {
    await open(page, '/');

    await expect(page.getByRole('heading', { name: /Bringing Data Together/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /SocioMap/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Archamap/i })).toBeVisible();
  });

  for (const db of ['sociomap', 'archamap']) {
    test(`${db} home page renders main content`, async ({ page }) => {
      await open(page, `/${db}`);

      await expect(page.getByRole('link', { name: 'Explore' }).first()).toHaveAttribute('href', `/${db}/explore`);
      await expect(page.getByRole('link', { name: 'Translate' }).first()).toHaveAttribute('href', `/${db}/translate`);
      await expect(page.getByText(/Dataset Progress/i)).toBeVisible();
    });

    test(`${db} explore page renders search UI`, async ({ page }) => {
      await open(page, `/${db}/explore`);

      await expect(page.getByPlaceholder('Search...')).toBeVisible();
      await expect(page.getByRole('button', { name: /Advanced Search/i })).toBeVisible();
    });

    test(`${db} translate page renders matching UI`, async ({ page }) => {
      await open(page, `/${db}/translate`);

      await expect(page.getByText(/Choose spreadsheet to match/i)).toBeVisible();
      await expect(page.getByText(/Select category domain/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /^Search$/i })).toBeVisible();
    });

    test(`${db} merge page renders tabbed workflow`, async ({ page }) => {
      await open(page, `/${db}/merge`);

      await expect(page.getByRole('tab', { name: /Propose merge/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /Join Datasets/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /Download merge template/i })).toBeVisible();
    });
  }
});

