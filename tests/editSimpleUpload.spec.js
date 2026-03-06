import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

const selectByIndex = async (page, index, optionName) => {
  await page.locator('div[role="combobox"]').nth(index).click();
  await page.getByRole('option', { name: optionName, exact: true }).click();
};

test.describe('Edit simple upload', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('userId', 'tester');
      localStorage.setItem('authToken', 'fake-token');
      localStorage.setItem('authLevel', '2');
      localStorage.setItem('cookie-consent', 'false');
    });
  });

  test('submits simple upload with selected key column in payload', async ({ page }) => {
    let capturedUploadPayload = null;

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

    await page.route('**/getDomains/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            display: 'LANGUAGE',
            subdisplay: 'DIALECT',
            subdomain: 'DIALECT',
            order: 1,
            suborder: 1,
          },
        ]),
      });
    });

    await page.route('**/uploadInputNodes', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }

      capturedUploadPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({
          taskId: 'upload-task-1',
          status: 'queued',
        }),
      });
    });

    await page.route('**/uploadInputNodesStatus', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          taskId: 'upload-task-1',
          status: 'completed',
          message: 'Upload completed for simple test.',
          progress: {
            batchSize: 500,
            totalRows: 1,
            totalBatches: 1,
            completedBatches: 1,
            percent: 100,
          },
          events: ['End of batch'],
          nextCursor: 1,
          file: [{ CMID: 'SM1001' }],
          order: ['CMID'],
        }),
      });
    });

    await page.goto(`${BASE_URL}/sociomap/edit`, { waitUntil: 'domcontentloaded' });

    await page.locator('#fileInput').setInputFiles({
      name: 'simple-upload.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('source_name,source_key\nAlpha,K1\n'),
    });

    await expect(page.getByText('Number of nodes to import: 1')).toBeVisible();
    await page.getByRole('radio', { name: 'Simple' }).click();

    await page.locator('input[name="datasetID"]').fill('AD1');

    // Combobox order here:
    // 0=template download, 1=rows-per-page, 2=domain, 3=subdomain,
    // 4=cmName, 5=categoryNames, 6=altNames, 7=cmid, 8=key
    await selectByIndex(page, 4, 'source_name');
    await selectByIndex(page, 8, 'source_key');

    await page.getByRole('button', { name: /^UPLOAD$/ }).click();

    await expect.poll(() => capturedUploadPayload).not.toBeNull();
    expect(capturedUploadPayload.so).toBe('simple');
    expect(capturedUploadPayload.formData.keyColumn).toBe('source_key');
    expect(capturedUploadPayload.formData.cmNameColumn).toBe('source_name');
    expect(capturedUploadPayload.df[0].source_key).toBe('K1');
    expect(capturedUploadPayload.df[0].source_name).toBe('Alpha');

    await expect(page.getByText('Upload completed for simple test.')).toBeVisible();
  });
});
