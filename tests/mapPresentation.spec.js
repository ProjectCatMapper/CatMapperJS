import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://127.0.0.1:3000';
const json = (route, body) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cookieConsent', 'rejected');
    localStorage.setItem('catmapper:cookie-consent-version', '2026-08-navigation-trail');
  });
  // A local, tile-free basemap makes map interaction checks independent of
  // tile providers. API responses below are fixtures; no live writes occur.
  await page.route('https://basemaps.cartocdn.com/**', (route) => json(route, {
    version: 8, sources: {}, layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#f1f5f9' } }],
  }));
  await page.route('https://api.catmapper.org/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.includes('/info/sociomap/')) {
      const cmid = path.split('/').pop();
      return json(route, { CMID: cmid, CMName: cmid === 'SD2247' ? 'Example dataset' : 'Klao', Domains: [cmid.startsWith('SD') ? 'DATASET' : 'LANGUAGE'] });
    }
    if (path.includes('/category/sociomap/')) {
      return json(route, { samples: [], categories: [], childcategories: [], relnames: [] });
    }
    if (path.endsWith('/exploreGeometry/sociomap/SM254978')) {
      return json(route, { polygons: [], datasetpoints: [], badsources: [], points: [
        { CMID: 'SM254978', CMName: 'Klao', source: 'Price1990', cood: [-8.03, 5.56] },
        { CMID: 'SM254978', CMName: 'Klao', source: 'EthnographicAtlas', cood: [-9, 5] },
        { CMID: 'SM254978', CMName: 'Klao', source: 'HRAF', cood: [-9, 5] },
      ] });
    }
    if (path.endsWith('/exploreGeometry/sociomap/SD2247')) {
      return json(route, { polygons: [], points: [], badsources: [], datasetpoints: [
        { CMID: 'SM226738', CMName: 'Basti', source: 'Example dataset', cood: [10, 20] },
        { CMID: 'SM259796', CMName: 'Kizombo', source: 'Example dataset', cood: [10, 20] },
      ] });
    }
    if (path.endsWith('/map-layer-options')) {
      return json(route, { layers: [], limits: {} });
    }
    if (path.includes('/metadata/')) return json(route, []);
    if (path.endsWith('/networkOptions')) return json(route, { relationships: [], domains: [], datasets: [] });
    if (path.endsWith('/networksjs')) return json(route, { node: [], relNodes: [], edge: [] });
    if (path.includes('/exploreGeometry/')) return json(route, { polygons: [], points: [], datasetpoints: [], badsources: [] });
    return json(route, {});
  });
});

test('category map keeps its dataset legend', async ({ page }, testInfo) => {
  await page.goto(`${BASE_URL}/sociomap/SM254978/map`);
  const legend = page.getByRole('group', { name: 'Map legend' });
  await expect(legend).toBeVisible();
  await expect(legend).toContainText('Price1990');
  await expect(legend).toContainText('EthnographicAtlas');
  await expect(legend).toContainText('HRAF');
  await expect(page.getByRole('group', { name: 'Map zoom controls' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('category-map.png'), fullPage: true });
});

test('dataset map lets the user choose a coincident node and open its page', async ({ page }, testInfo) => {
  await page.goto(`${BASE_URL}/sociomap/SD2247/map`);
  await expect(page.getByRole('group', { name: 'Map legend' })).toHaveCount(0);
  await expect(page.getByLabel('Category locations', { exact: true })).toBeChecked();
  const canvas = page.locator('canvas#deckgl-overlay');
  await expect(canvas).toBeVisible();
  // The fixture points share a location, which is centered by fit-to-bounds.
  const stackCenter = async () => {
    await canvas.scrollIntoViewIfNeeded();
    const box = await canvas.boundingBox();
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  };
  // Wait for GPU picking to identify the point before clicking. The canvas can
  // be visible before its first render; repeated early clicks can zoom the map.
  const hoverStack = () => expect(async () => {
    const center = await stackCenter();
    await page.mouse.move(center.x + 1, center.y);
    await page.mouse.move(center.x, center.y);
    await expect(page.getByText('Click to identify all points', { exact: false })).toBeVisible({ timeout: 500 });
  }).toPass({ timeout: 10000 });
  await hoverStack();
  const center = await stackCenter();
  await page.mouse.click(center.x, center.y);
  await expect(page.getByRole('dialog', { name: '2 points at this location' })).toBeVisible();
  await page.getByRole('button', { name: 'Close point list' }).click();
  await expect(page.getByRole('dialog', { name: '2 points at this location' })).toHaveCount(0);
  // Separate the two point clicks beyond the map's double-click gesture window.
  await page.waitForTimeout(400);
  await hoverStack();
  const reopenedCenter = await stackCenter();
  await page.mouse.click(reopenedCenter.x, reopenedCenter.y);
  await expect(page.getByRole('dialog', { name: '2 points at this location' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('dataset-map.png'), fullPage: true });
  await page.getByRole('link', { name: 'Basti', exact: true }).click();
  await expect(page).toHaveURL(/\/sociomap\/SM226738(?:\/network)?$/);
});

test('clicking a single dataset point opens its category page', async ({ page }) => {
  await page.route('**/exploreGeometry/sociomap/SD2247', (route) => json(route, {
    polygons: [], points: [], badsources: [], datasetpoints: [
      { CMID: 'SM226738', CMName: 'Basti', source: 'Example dataset', cood: [10, 20] },
    ],
  }));
  await page.goto(`${BASE_URL}/sociomap/SD2247/map`);
  const canvas = page.locator('canvas#deckgl-overlay');
  await expect(canvas).toBeVisible();
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  await expect(async () => {
    await page.mouse.move(center.x + 1, center.y);
    await page.mouse.move(center.x, center.y);
    await expect(page.getByText('CMID: SM226738', { exact: false })).toBeVisible({ timeout: 500 });
  }).toPass({ timeout: 10000 });
  await page.mouse.click(center.x, center.y);
  await expect(page).toHaveURL(/\/sociomap\/SM226738(?:\/network)?$/);
});
