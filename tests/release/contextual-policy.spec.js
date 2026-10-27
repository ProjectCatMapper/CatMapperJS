import { test, expect } from '@playwright/test';

const api = process.env.API_URL || 'https://dev-api.catmapper.org';

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
  { database: 'sociomap', cmid: 'SM22210', property: 'language' },
  { database: 'archamap', cmid: 'AM353935', property: 'culture' },
]) {
  test(`${sample.database} hides prohibited edits and retains existing deletion choices`, async ({ page }) => {
    await page.goto(`/${sample.database}/admin`);
    const lookup = page.waitForResponse(response => response.url().includes('/admin_add_edit_delete_usesproperties?')
      && new URL(response.url()).searchParams.get('CMID') === sample.cmid);
    await page.getByLabel('CMID of Category').fill(sample.cmid);
    const ties = (await (await lookup).json()).r;
    const tieIndex = ties.findIndex(tie => Object.hasOwn(tie[1], 'country'));
    expect(tieIndex).toBeGreaterThanOrEqual(0);
    await expect(page.getByLabel('Choose USES tie to change')).toBeVisible();
    await page.getByLabel('Choose USES tie to change').click();
    await page.locator(`[role="option"][data-value="${tieIndex + 1}"]`).click();
    await page.getByLabel('Choose property to edit').click();
    await expect(page.getByRole('option', { name: sample.property, exact: true })).toHaveCount(0);
    await page.keyboard.press('Escape');
    await page.getByLabel('delete', { exact: true }).check();
    await page.getByLabel('Choose USES tie to change').click();
    await page.locator(`[role="option"][data-value="${tieIndex + 1}"]`).click();
    await page.getByLabel('Choose property to delete').click();
    await expect(page.getByRole('option', { name: 'country', exact: true })).toBeVisible();
  });
}
