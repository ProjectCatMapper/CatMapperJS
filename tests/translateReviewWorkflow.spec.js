import { test, expect } from '@playwright/test';
import XLSX from 'xlsx';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

const translateResponse = {
  order: [
    'term',
    'matching_term',
    'matchingDistance_term',
    'matchType_term',
    'CMName_term',
    'CMID_term',
    'label_term',
    'CMcountry_term',
    'CMuniqueRowID',
    'note',
  ],
  file: [
    {
      term: 'alpha',
      matching_term: 'alpha',
      matchingDistance_term: 0,
      matchType_term: 'one-to-many',
      CMName_term: 'Alpha Group A',
      CMID_term: 'SM1',
      label_term: 'FAMILY',
      CMcountry_term: 'Nigeria',
      CMuniqueRowID: 'u-1',
      note: 'a',
    },
    {
      term: 'alpha',
      matching_term: 'alpha',
      matchingDistance_term: 1,
      matchType_term: 'one-to-many',
      CMName_term: 'Alpha Group B',
      CMID_term: 'SM2',
      label_term: 'FAMILY',
      CMcountry_term: 'Nigeria',
      CMuniqueRowID: 'u-1',
      note: 'a',
    },
    {
      term: 'beta',
      matching_term: 'beta',
      matchingDistance_term: 0,
      matchType_term: 'exact match',
      CMName_term: 'Beta',
      CMID_term: 'SM3',
      label_term: 'FAMILY',
      CMcountry_term: 'Ghana',
      CMuniqueRowID: 'u-2',
      note: 'b',
    },
  ],
};

const selectByIndex = async (page, index, optionName) => {
  await page.locator('div[role="combobox"]').nth(index).click();
  await page.getByRole('option', { name: optionName, exact: true }).click();
};

test.describe('Translate review workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('userId', 'tester');
      localStorage.setItem('authToken', 'fake-token');
      localStorage.setItem('authLevel', '2');
      localStorage.setItem('cookie-consent', 'false');
    });

    await page.route('**/getTranslatedomains?database=sociomap', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ group: 'FAMILY', nodes: ['FAMILY'] }]),
      });
    });

    await page.route('**/metadata/domainDescriptions/sociomap', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ label: 'FAMILY', description: 'Family domain' }]),
      });
    });

    await page.route('**/metadata/subdomains/sociomap', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ domain: 'FAMILY', subdomains: ['FAMILY'] }]),
      });
    });

    await page.route('**/translate', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(translateResponse),
      });
    });

    await page.route('**/profile/bookmarks/tester', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          bookmarks: [{ database: 'sociomap', cmid: 'SM999', cmname: 'Saved Choice' }],
        }),
      });
    });

    await page.route('**/profile/history/tester', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ history: [] }),
      });
    });
  });

  test('supports remove, manual replace, bookmark replace, one-to-many resolution, and clean export', async ({ page }) => {
    await page.goto(`${BASE_URL}/sociomap/translate`, { waitUntil: 'domcontentloaded' });

    await page.locator('#fileInput').setInputFiles({
      name: 'translate-input.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('term,note\nalpha,a\nbeta,b\n'),
    });

    await selectByIndex(page, 0, 'term');
    await page.getByRole('button', { name: /^Search$/i }).click();

    await expect(page.getByRole('heading', { name: /Review & Clean Matches/i })).toBeVisible();
    await expect(page.getByText('SM1')).toBeVisible();
    await expect(page.getByText('SM2')).toBeVisible();
    await expect(page.getByText('SM3')).toBeVisible();

    await page.getByRole('button', { name: /^Remove$/, exact: true }).first().click();
    await expect(page.getByText('SM1')).toHaveCount(0);
    await expect(page.getByText('alpha').first()).toBeVisible();

    const betaRow = page.locator('div[role="row"]', { hasText: 'beta' }).first();
    await betaRow.getByRole('checkbox', { name: 'Select row' }).click();

    await page.getByLabel('Replace with CMID').fill('SM777');
    await page.getByRole('button', { name: /Apply CMID To Selected/i }).click();
    await expect(page.getByText('SM777')).toBeVisible();

    await page.getByRole('button', { name: /Insert CMID from Bookmarks/i }).click();
    const popover = page.locator('.MuiPopover-paper');
    await popover.locator('div[role="combobox"]').click();
    await page.getByRole('option', { name: /SM999 - Saved Choice/i }).click();
    await popover.getByRole('button', { name: /Insert CMID/i }).click();
    await expect(page.locator('div[role="row"]', { hasText: 'beta' }).first()).toContainText('SM999');
    await popover.getByRole('button', { name: /^Close$/i }).click();

    await page.locator('div[role="combobox"]', { hasText: 'Select one-to-many group' }).click();
    await page.getByRole('option', { name: 'Group u-1 (2 rows)', exact: true }).click();

    await page.locator('div[role="combobox"]', { hasText: 'Select row to keep' }).click();
    await page.getByRole('option', { name: /Keep SM2/i }).click();
    await page.getByRole('button', { name: /Resolve Group/i }).click();
    await expect(page.getByText('Resolved duplicate group by keeping one row.')).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Download proposed matches/i }).click();
    const download = await downloadPromise;
    const filePath = await download.path();

    expect(filePath).toBeTruthy();
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const exportedRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    expect(exportedRows.length).toBeGreaterThan(0);
    expect(Object.keys(exportedRows[0])).not.toContain('__reviewId');

    const beta = exportedRows.find((row) => row.term === 'beta');
    expect(beta).toBeTruthy();
    expect(beta.CMID_term).toBe('SM999');
    expect(beta.note).toBe('b');
  });
});
