import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test('Explore table renders buttons correctly', async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.setItem('userId', 'tester');
        localStorage.setItem('authToken', 'fake-token');
        localStorage.setItem('authLevel', '2');
        localStorage.setItem('cookie-consent', 'false');
    });

    await page.route('**/profile/bookmarks/add', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ status: 'ok' }),
        });
    });

    await Promise.all([
        page.waitForResponse(resp => resp.url().includes('/explore?domain') && resp.status() === 200),
        page.goto(`${BASE_URL}/sociomap/explore?domain=ALL%20NODES&property=Name&term=yoruba&database=sociomap`),
    ]);
    // Check for the Green "View" button
    const viewButton = page.locator('button:has-text("View")').first();
    await expect(viewButton).toBeVisible();
    await expect(viewButton).toHaveCSS('background-color', 'rgb(46, 125, 50)'); // MUI Success Green

    // Check for Bookmark icon and tooltip
    const bookmarkBtn = page.getByRole('button', { name: 'Bookmark' }).first();
    await bookmarkBtn.hover();
    await expect(page.getByText('Bookmark')).toBeVisible();

    // Test bookmark success notice
    await bookmarkBtn.click();
    await expect(page.getByText(/Bookmarked/i)).toBeVisible();
});
