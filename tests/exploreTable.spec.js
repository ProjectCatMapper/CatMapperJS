import { test, expect } from '@playwright/test';

test('Explore table renders buttons correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/sociomap/explore?domain=ALL+NODES&property=Name&term=yoruba&database=sociomap');
    // Check for the Green "View" button
    const viewButton = page.locator('button:has-text("View")').first();
    await expect(viewButton).toBeVisible();
    await expect(viewButton).toHaveCSS('background-color', 'rgb(46, 125, 50)'); // MUI Success Green

    // Check for Bookmark icon and tooltip
    const bookmarkBtn = page.locator('button [data-testid="BookmarkBorderIcon"]').first();
    await bookmarkBtn.hover();
    await expect(page.getByText('Bookmark')).toBeVisible();

    // Test the "In Progress" notice
    await bookmarkBtn.click();
    await expect(page.getByText('Bookmark feature coming soon!')).toBeVisible();
});