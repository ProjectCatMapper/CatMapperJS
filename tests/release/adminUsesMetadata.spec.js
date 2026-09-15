import { test, expect } from '@playwright/test';

test('deployed CatMapper is reachable for Admin release checks', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/CatMapper/i);
});
