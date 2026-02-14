import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

const metadataIndexPayload = {
  SocioMap: [
    {
      id: 's1',
      CMID: 'SM241131',
      CMName: 'Sample Family',
      groupLabel: 'FAMILY',
      color: '#22aa44',
      labels: ['FAMILY', 'METADATA'],
    },
  ],
  ArchaMap: [
    {
      id: 'a1',
      CMID: 'AM100001',
      CMName: 'Sample Ceramic',
      groupLabel: 'CERAMIC_TYPE',
      color: '#8855cc',
      labels: ['CERAMIC_TYPE', 'METADATA'],
    },
  ],
};

const nodePayload = [
  {
    SocioMap: {
      id: 's1',
      labels: ['METADATA', 'FAMILY'],
      properties: {
        CMID: 'SM241131',
        CMName: 'Sample Family',
        color: '#22aa44',
        description: 'Original description',
      },
    },
  },
];

test.describe('Admin metadata manager', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('authLevel', '2');
      localStorage.setItem('authToken', 'fake-admin-token');
      localStorage.setItem('cookie-consent', 'false');
    });

    await page.route('**/admin/metadata/nodes', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(metadataIndexPayload),
      });
    });

    await page.route('**/admin/metadata/node/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(nodePayload),
      });
    });

    await page.route('**/admin/saveMetadata', async (route) => {
      const payload = route.request().postDataJSON();
      const hasExpectedNode = Array.isArray(payload?.updates)
        && payload.updates.some((u) => u.id === 's1');

      if (!hasExpectedNode) {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid updates payload' }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Updated 1 nodes.', updatedCount: 1 }),
      });
    });
  });

  test('lists metadata nodes grouped by database/subdomain and opens read-only view', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/metadata`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: /Metadata Nodes \(Admin\)/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'SocioMap' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'ArchaMap' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'FAMILY' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'CERAMIC_TYPE' })).toBeVisible();
    await expect(page.getByRole('cell', { name: '#22aa44' })).toBeVisible();

    const row = page.locator('tr', { hasText: 'SM241131' });
    await row.getByRole('button', { name: 'View' }).click();
    await expect(page).toHaveURL(/\/admin\/metadata\/sociomap\/SM241131\/view$/);
    await expect(page.getByRole('heading', { name: /View Metadata Node/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Save Changes/i })).toHaveCount(0);
  });

  test('edits metadata and validates save response path', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/metadata`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Edit' }).first().click();

    await expect(page.getByRole('heading', { name: /Edit Metadata Node/i })).toBeVisible();

    const descriptionInput = page.getByLabel('description');
    await descriptionInput.fill('Updated description from test');
    await page.getByRole('button', { name: /Save Changes/i }).click();

    await expect(page.getByText(/Updated 1 nodes\./i)).toBeVisible();
  });
});
