import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Mobile layout regression checks', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  const routes = ['/sociomap', '/archamap', '/FAQ', '/sociomap/merge'];

  for (const route of routes) {
    test(`${route} should not have horizontal overflow on mobile`, async ({ page }) => {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);

      const hasOverflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth > window.innerWidth + 1;
      });

      expect(hasOverflow).toBeFalsy();
    });
  }

  test('/sociomap should render mobile nav trigger', async ({ page }) => {
    await page.goto(`${BASE_URL}/sociomap`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.cm-nav-hamburger')).toBeVisible();
  });
});
