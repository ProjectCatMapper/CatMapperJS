import { test, expect } from '@playwright/test';

test('owner metadata is absent from Admin USES edit/delete choices', async ({ page }) => {
  await page.goto('/sociomap/admin');
  await expect(page.getByText('Selected option: add/edit/delete USES property')).toBeVisible();
  await page.getByLabel('CMID of Category').fill('SM241701');
  await expect(page.getByLabel('Choose USES tie to change')).toBeVisible();
  await page.getByLabel('Choose USES tie to change').click();
  await page.getByRole('option', { name: /Global Atlas of Dialects/ }).click();
  await page.getByLabel('Choose property to edit').click();
  await expect(page.getByRole('option', { name: 'ownerUserId', exact: true })).toHaveCount(0);
  await expect(page.getByRole('option', { name: 'modifiedByOtherUser', exact: true })).toHaveCount(0);
  await expect(page.getByRole('option', { name: 'Name', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');

  await page.getByLabel('delete', { exact: true }).check();
  await page.getByLabel('Choose USES tie to change').click();
  await page.getByRole('option', { name: /Global Atlas of Dialects/ }).click();
  await page.getByLabel('Choose property to delete').click();
  await expect(page.getByRole('option', { name: 'ownerUserId', exact: true })).toHaveCount(0);
  await expect(page.getByRole('option', { name: 'modifiedByOtherUser', exact: true })).toHaveCount(0);
  await expect(page.getByRole('option', { name: 'country', exact: true })).toBeVisible();
});
