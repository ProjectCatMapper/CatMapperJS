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
      labels: ['LABEL', 'METADATA'],
    },
  ],
  ArchaMap: [
    {
      id: 'a1',
      CMID: 'AM100001',
      CMName: 'Sample Ceramic',
      groupLabel: 'CERAMIC_TYPE',
      color: '#8855cc',
      labels: ['PROPERTY', 'METADATA'],
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
  {
    ArchaMap: {
      id: 'a1',
      labels: ['METADATA', 'CERAMIC_TYPE'],
      properties: {
        CMID: 'AM100001',
        CMName: 'Sample Ceramic',
        color: '#8855cc',
        description: 'Archa description',
      },
    },
  },
];

test.describe('Admin metadata manager', () => {
  test.beforeEach(async ({ page }) => {
    let createdNode = null;
    const nextByPrefix = {
      CP: 800000,
      CL: 800000,
      CT: 800000,
    };

    await page.addInitScript(() => {
      localStorage.setItem('userId', 'playwright-admin');
      localStorage.setItem('authLevel', '2');
      localStorage.setItem('authToken', 'fake-admin-token');
      localStorage.setItem('cookie-consent', 'false');
    });

    await page.route('**/admin/metadata/nodes', async (route) => {
      const payload = JSON.parse(JSON.stringify(metadataIndexPayload));
      if (createdNode) {
        const node = {
          id: 'new-node-id',
          CMID: createdNode.CMID,
          CMName: createdNode.CMName,
          groupLabel: createdNode.groupLabel || 'UNMAPPED',
          color: createdNode.color || '#404040',
          labels: [String(createdNode.nodeLabel || 'LABEL').toUpperCase(), 'METADATA'],
        };
        if (createdNode.databaseTarget === 'both' || createdNode.databaseTarget === 'sociomap') {
          payload.SocioMap.push(node);
        }
        if (createdNode.databaseTarget === 'both' || createdNode.databaseTarget === 'archamap') {
          payload.ArchaMap.push(node);
        }
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(payload),
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

    await page.route('**/admin/metadata/create', async (route) => {
      const payload = route.request().postDataJSON();
      const hasRequired = payload?.CMName && payload?.nodeLabel;
      if (!hasRequired) {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'CMName and nodeLabel required' }),
        });
        return;
      }

      const upperNodeLabel = String(payload.nodeLabel).toUpperCase();
      const prefixMap = { PROPERTY: 'CP', LABEL: 'CL', TRANSLATION: 'CT' };
      const prefix = prefixMap[upperNodeLabel];
      nextByPrefix[prefix] += 1;
      const generatedCMID = `${prefix}${nextByPrefix[prefix]}`;

      createdNode = { ...payload, CMID: generatedCMID };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: `Created metadata node ${generatedCMID} in SocioMap, ArchaMap.`,
          generatedCMID,
          createdIn: ['SocioMap', 'ArchaMap'],
        }),
      });
    });
  });

  test('lists metadata nodes grouped by database/subdomain and opens read-only view', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/metadata`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: /Metadata Nodes \(Admin\)/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'SocioMap' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'ArchaMap' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'LABEL' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'PROPERTY' })).toBeVisible();
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

    const descriptionInput = page.getByLabel('description').first();
    await descriptionInput.fill('Updated description from test');
    await page.getByRole('button', { name: /Save Changes/i }).click();

    await expect(page.getByText(/Updated 1 nodes\./i)).toBeVisible();
  });

  test('adds a new property and can target both databases', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/metadata`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Edit' }).first().click();

    await page.getByLabel('New property name').first().fill('SharedProperty');
    await page.getByLabel('Add to database').first().click();
    await page.getByRole('option', { name: 'Both databases' }).click();
    await page.getByRole('button', { name: 'Add Property' }).first().click();

    await expect(page.getByLabel('SharedProperty')).toHaveCount(2);
  });

  test('creates a new metadata node from the metadata list page', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/metadata`, { waitUntil: 'domcontentloaded' });

    await page.getByLabel('Node Name').fill('Playwright New Label');
    await page.getByLabel('Node Label').click();
    await page.getByRole('option', { name: 'LABEL' }).click();
    await page.getByLabel('Group Label').fill('FAMILY');
    await page.getByLabel('Description').fill('Created from test');
    await page.getByLabel('Create In Database').click();
    await page.getByRole('option', { name: 'Both databases' }).click();
    await page.getByRole('button', { name: 'Create Metadata Node' }).click();

    await expect(page.getByText(/Created metadata node CL800001/i)).toBeVisible();
    await expect(page.getByRole('cell', { name: 'CL800001' }).first()).toBeVisible();
  });
});
