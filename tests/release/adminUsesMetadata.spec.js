import { test, expect } from '@playwright/test';

test('owner metadata is absent from Admin USES edit/delete choices', async ({ page }) => {
  await page.goto('/admin');
  await page.getByText('add/edit/delete USES property', { exact: true }).click();
  await page.getByLabel('delete', { exact: true }).check();
  await page.getByLabel('CMID of Category').fill('SM241701');
  await expect(page.getByLabel('Choose USES tie to change')).toBeVisible();
  await page.getByLabel('Choose USES tie to change').click();
  await page.getByRole('option').first().click();
  await page.getByLabel('Choose property to delete').click();
  await expect(page.getByRole('option', { name: 'ownerUserID', exact: true })).toHaveCount(0);
  await expect(page.getByRole('option', { name: 'modifiedByOTherUser', exact: true })).toHaveCount(0);
  await expect(page.getByRole('option', { name: 'Name', exact: true })).toBeVisible();
});
