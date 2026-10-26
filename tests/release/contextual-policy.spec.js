import { test, expect } from '@playwright/test';

const api = 'https://dev-api.catmapper.org';

test('metadata policies validate both maps without writing source records', async ({ request }) => {
  for (const database of ['SocioMap', 'ArchaMap']) {
    const response = await request.get(`${api}/api/databases/${database}/metadata/contextual-policy`);
    expect(response.ok()).toBeTruthy();
    const policy = await response.json();
    expect(policy.enabled).toBe(true);
    expect(policy.domains.AREA.mode).toBe('ALL_EXCEPT');
    expect(policy.domains.AREA.targets).toEqual([]);
  }
  const examples = [
    ['SocioMap', { label: 'PPL', language: 'SM249440' }, 400],
    ['SocioMap', { label: 'ETHNICITY', language: 'SM249440' }, 200],
    ['ArchaMap', { label: 'SITE', period: 'AM23576' }, 400],
    ['ArchaMap', { label: 'PERIOD', culture: 'AM23935' }, 400],
    ['ArchaMap', { label: 'CULTURE', period: 'AM23576' }, 200],
    ['ArchaMap', { label: 'CERAMIC_TYPE', culture: 'AM23935' }, 200],
  ];
  for (const [database, row, status] of examples) {
    const response = await request.post(`${api}/api/databases/${database}/metadata/contextual-policy/validate`, {
      data: { rows: [row] },
    });
    expect(response.status(), JSON.stringify(row)).toBe(status);
    expect((await response.json()).writes).toBe(0);
  }
});

for (const sample of [
  { database: 'sociomap', cmid: 'SM22210', dataset: /Halaoui/, property: 'language' },
  { database: 'archamap', cmid: 'AM23559', dataset: /./, property: 'culture' },
]) {
  test(`${sample.database} hides prohibited edits and permits deletion`, async ({ page }) => {
    await page.goto(`/${sample.database}/admin`);
    await page.getByLabel('CMID of Category').fill(sample.cmid);
    await expect(page.getByLabel('Choose USES tie to change')).toBeVisible();
    await page.getByLabel('Choose USES tie to change').click();
    await page.getByRole('option').filter({ hasText: sample.dataset }).first().click();
    await page.getByLabel('Choose property to edit').click();
    await expect(page.getByRole('option', { name: sample.property, exact: true })).toHaveCount(0);
    await page.keyboard.press('Escape');
    await page.getByLabel('delete', { exact: true }).check();
    await page.getByLabel('Choose USES tie to change').click();
    await page.getByRole('option').filter({ hasText: sample.dataset }).first().click();
    await page.getByLabel('Choose property to delete').click();
    await expect(page.getByRole('option', { name: sample.property, exact: true })).toBeVisible();
  });
}
