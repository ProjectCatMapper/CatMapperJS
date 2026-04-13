/**
 * translateNavigation.spec.js
 *
 * End-to-end tests verifying that the Translate page preserves form and data
 * state across client-side navigation within the SPA.
 *
 * Scenario:
 *   1. Navigate to the translate page.
 *   2. Upload a CSV file and pick the match column.
 *   3. Navigate away to a different route.
 *   4. Navigate back to the translate page.
 *   5. Assert that the uploaded data and selected column are still present.
 *
 * The translate API endpoints are mocked so the test runs without a real
 * backend.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

// ---------------------------------------------------------------------------
// Shared mock helpers
// ---------------------------------------------------------------------------

const CSV_CONTENT = 'species,note\nAlpha Wolf,a\nBeta Bear,b\n';

const setupCommonMocks = async (page) => {
  await page.addInitScript(() => {
    localStorage.setItem('userId', 'tester');
    localStorage.setItem('authToken', 'fake-token');
    localStorage.setItem('authLevel', '2');
    localStorage.setItem('cookie-consent', 'false');
  });

  await page.route('**/getTranslatedomains?database=archamap', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ group: 'CERAMIC', nodes: ['CERAMIC'] }]),
    });
  });

  await page.route('**/metadata/domainDescriptions/archamap', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ label: 'CERAMIC', description: 'Ceramic types' }]),
    });
  });

  await page.route('**/metadata/subdomains/archamap', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ domain: 'CERAMIC', subdomains: ['CERAMIC'] }]),
    });
  });

  await page.route('**/profile/bookmarks/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ bookmarks: [] }),
    });
  });

  await page.route('**/profile/history/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ history: [] }),
    });
  });

  await page.route('**/homepagecount/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Translate page state persistence across navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupCommonMocks(page);
  });

  test('restores uploaded file columns and selected column after navigating away and back', async ({
    page,
  }) => {
    // 1. Visit the translate page
    await page.goto(`${BASE_URL}/archamap/translate`, { waitUntil: 'domcontentloaded' });

    // 2. Upload a CSV file
    await page.locator('#fileInput').setInputFiles({
      name: 'fauna-input.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(CSV_CONTENT),
    });

    // The column-select dropdown should appear after parsing
    await expect(page.locator('div[role="combobox"]').first()).toBeVisible();

    // 3. Pick the "species" column as the match column
    await page.locator('div[role="combobox"]').first().click();
    await page.getByRole('option', { name: 'species', exact: true }).click();

    // Confirm the selection took effect (the dropdown now shows "species")
    await expect(page.locator('div[role="combobox"]').first()).toContainText('species');

    // 4. Navigate away to a different page (the database home)
    await page.goto(`${BASE_URL}/archamap`, { waitUntil: 'domcontentloaded' });

    // 5. Navigate back to the translate page via client-side routing
    await page.goto(`${BASE_URL}/archamap/translate`, { waitUntil: 'domcontentloaded' });

    // 6. The column-select dropdown should still be present and show "species"
    await expect(page.locator('div[role="combobox"]').first()).toBeVisible();
    await expect(page.locator('div[role="combobox"]').first()).toContainText('species');
  });

  test('restores review results (match rows) after navigating away and back', async ({ page }) => {
    let statusPollCount = 0;

    // Extra mocks for a complete search flow
    await page.route('**/translate/start', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'processing',
          taskId: 'task-persist-1',
          percent: 10,
          message: 'Processing...',
          elapsedSeconds: 0,
        }),
      });
    });

    await page.route('**/translate/status', async (route) => {
      statusPollCount += 1;
      if (statusPollCount < 2) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'processing',
            taskId: 'task-persist-1',
            percent: 50,
            message: 'Matching...',
            elapsedSeconds: 0.5,
          }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'completed',
          taskId: 'task-persist-1',
          percent: 100,
          message: 'Completed.',
          elapsedSeconds: 1.0,
          order: ['species', 'matching_species', 'matchingDistance_species', 'matchType_species', 'CMName_species', 'CMID_species', 'label_species', 'CMcountry_species', 'CMuniqueRowID', 'note'],
          file: [
            {
              species: 'Alpha Wolf',
              matching_species: 'Alpha Wolf',
              matchingDistance_species: 0,
              matchType_species: 'exact match',
              CMName_species: 'Alpha Wolf',
              CMID_species: 'AM1',
              label_species: 'CERAMIC',
              CMcountry_species: '',
              CMuniqueRowID: 'u-1',
              note: 'a',
            },
            {
              species: 'Beta Bear',
              matching_species: 'Beta Bear',
              matchingDistance_species: 0,
              matchType_species: 'exact match',
              CMName_species: 'Beta Bear',
              CMID_species: 'AM2',
              label_species: 'CERAMIC',
              CMcountry_species: '',
              CMuniqueRowID: 'u-2',
              note: 'b',
            },
          ],
          warnings: [],
        }),
      });
    });

    // 1. Visit translate page
    await page.goto(`${BASE_URL}/archamap/translate`, { waitUntil: 'domcontentloaded' });

    // 2. Upload CSV
    await page.locator('#fileInput').setInputFiles({
      name: 'fauna-input.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(CSV_CONTENT),
    });

    // 3. Select the match column
    await expect(page.locator('div[role="combobox"]').first()).toBeVisible();
    await page.locator('div[role="combobox"]').first().click();
    await page.getByRole('option', { name: 'species', exact: true }).click();

    // 4. Run the search
    await page.getByRole('button', { name: /^Search$/i }).click();

    // 5. Wait for results heading
    await expect(page.getByRole('heading', { name: /Review & Clean Matches/i })).toBeVisible({
      timeout: 15_000,
    });

    // Verify both result rows are visible
    await expect(page.getByText('AM1')).toBeVisible();
    await expect(page.getByText('AM2')).toBeVisible();

    // 6. Navigate away
    await page.goto(`${BASE_URL}/archamap`, { waitUntil: 'domcontentloaded' });

    // 7. Navigate back
    await page.goto(`${BASE_URL}/archamap/translate`, { waitUntil: 'domcontentloaded' });

    // 8. The Review & Clean Matches section should still be shown with the same results
    await expect(page.getByRole('heading', { name: /Review & Clean Matches/i })).toBeVisible();
    // Both rows from the original search must still be present
    await expect(page.getByText('AM1')).toBeVisible();
    await expect(page.getByText('AM2')).toBeVisible();
  });
});
