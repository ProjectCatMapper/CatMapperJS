import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

const json = (route, body) => route.fulfill({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

test('category network page keeps the complete category header visible', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cookie-consent', 'false');
  });

  await page.route('https://api.catmapper.org/api/**', async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname.endsWith('/info/sociomap/SM492762')) {
      return json(route, {
        CMID: 'SM492762',
        CMName: 'Vandals',
        Domains: 'ETHNICITY',
        Languages: 'vand1245',
        Location: '',
        Religions: '',
        UsesComments: [],
        direct_Children: 1,
        all_Descendants: 1,
        direct_Parents: 1,
      });
    }

    if (url.pathname.endsWith('/category/sociomap/SM492762')) {
      return json(route, {
        samples: [],
        categories: [],
        childcategories: [],
        relnames: ['CONTAINS'],
      });
    }

    if (url.pathname.endsWith('/networkOptions')) {
      return json(route, {
        relationships: ['CONTAINS'],
        domains: ['ETHNICITY'],
        datasets: ['All'],
      });
    }

    if (url.pathname.endsWith('/networksjs')) {
      return json(route, { node: [], relNodes: [], edge: [] });
    }

    if (url.pathname.endsWith('/metadata/subdomains/sociomap')) {
      return json(route, [{ domain: 'ETHNICITY', subdomains: ['ETHNICITY'] }]);
    }

    if (url.pathname.endsWith('/metadata/domainDescriptions/sociomap')) {
      return json(route, []);
    }

    if (url.pathname.endsWith('/datasetDomains')) {
      return json(route, [{ label: 'ETHNICITY' }]);
    }

    if (url.pathname.endsWith('/exploreGeometry/sociomap/SM492762')) {
      return json(route, { polygons: [], points: [], datasetpoints: [], badsources: [] });
    }

    if (url.pathname.endsWith('/databases/sociomap/nodes/SM492762/map-layer-options')) {
      return json(route, { layers: [], limits: {} });
    }

    return json(route, {});
  });

  await page.goto(`${BASE_URL}/sociomap/SM492762/network`, { waitUntil: 'networkidle' });

  await expect(page.locator('.category-info-header-title')).toHaveText('Category Info');

  const header = page.locator('.category-info-grid');
  await expect(header).toContainText('CatMapper Name');
  await expect(header).toContainText('Vandals');
  await expect(header).toContainText('CatMapper ID');
  await expect(header).toContainText('SM492762');
  await expect(header).toContainText('Domain');
  await expect(header).toContainText('ETHNICITY');
  await expect(header).not.toContainText('No data');
});
