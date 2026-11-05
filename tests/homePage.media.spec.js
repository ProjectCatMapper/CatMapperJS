import { test, expect } from '@playwright/test';

const counts = {
  sociomap: [
    { label: 'ETHNICITY', node_count: 26500, display: 'Ethnicities' },
    { label: 'RELIGION', node_count: 3500, display: 'Religions' },
    { label: 'LANGUOID', node_count: 29500, display: 'Languages' },
    { label: 'AREA', node_count: 217500, display: 'Areas' },
  ],
  archamap: [
    { label: 'SITE', node_count: 104500, display: 'Sites' },
    { label: 'PERIOD', node_count: 11500, display: 'Periods' },
    { label: 'CULTURE', node_count: 2500, display: 'Cultures' },
    { label: 'OBJECT', node_count: 4500, display: 'Artifact Types' },
  ],
};

test.beforeEach(async ({ page }) => {
  // Keep these browser tests independent of API availability and live counts.
  await page.route('**/api/**', (route) => {
    const path = new URL(route.request().url()).pathname;
    const database = path.split('/').at(-1);
    const json = path.includes('/homepagecount/') ? counts[database]
      : path.includes('/domaincount/') ? 42 : [];
    return route.fulfill({ json });
  });
});

async function expectReadableContent(page, database) {
  const hero = page.locator('.hero');
  const heading = hero.getByRole('heading');
  for (const item of counts[database]) {
    await expect(heading).toContainText(`${Math.floor(item.node_count / 1000) * 1000}+ ${item.display}`);
  }
  await expect(heading).toBeVisible();
  await expect(hero.locator('p')).toContainText(database === 'sociomap' ? 'SocioMap organizes' : 'ArchaMap organizes');
  await expect(hero.getByRole('link', { name: 'Explore', exact: true })).toHaveAttribute('href', `/${database}/explore`);
  await expect(hero.getByRole('link', { name: 'Translate', exact: true })).toHaveAttribute('href', `/${database}/translate`);

  // Visibility assertions alone pass for white text on a white background.
  const { contrast, backgroundAlpha } = await heading.evaluate((element) => {
    const foreground = getComputedStyle(element).color.match(/[\d.]+/g).map(Number);
    const background = getComputedStyle(element.closest('.hero')).backgroundColor.match(/[\d.]+/g).map(Number);
    const luminance = (channels) => channels.slice(0, 3).map((channel) => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
    const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    return { contrast: (values[0] + 0.05) / (values[1] + 0.05), backgroundAlpha: background[3] ?? 1 };
  });
  expect(backgroundAlpha).toBe(1);
  expect(contrast).toBeGreaterThanOrEqual(4.5);
}

for (const database of Object.keys(counts)) {
  test(`${database} plays the background video behind readable statistics`, async ({ page }) => {
    await page.goto(`/${database}`);
    const video = page.locator('.hero video');
    await expect(video.locator('source[type="video/webm"]')).toHaveAttribute('src', /\.webm$/);
    await expect(video.locator('source[type="video/mp4"]')).toHaveAttribute('src', /\.mp4$/);
    await expect.poll(() => video.evaluate((element) => element.currentTime)).toBeGreaterThan(0);
    await expectReadableContent(page, database);
  });

  test(`${database} plays MP4 when WebM fails`, async ({ page }) => {
    await page.route('**/*.webm', (route) => route.abort());
    await page.goto(`/${database}`);
    const video = page.locator('.hero video');
    await expect.poll(() => video.evaluate((element) => element.currentSrc)).toMatch(/\.mp4$/);
    await expect.poll(() => video.evaluate((element) => element.currentTime)).toBeGreaterThan(0);
    await expectReadableContent(page, database);
  });

  test(`${database} keeps statistics readable when both videos fail`, async ({ page }) => {
    await page.route(/\.(webm|mp4)$/, (route) => route.abort());
    await page.goto(`/${database}`);
    await expect.poll(() => page.locator('.hero video').evaluate((element) => element.networkState)).toBe(3);
    await expectReadableContent(page, database);
  });
}
