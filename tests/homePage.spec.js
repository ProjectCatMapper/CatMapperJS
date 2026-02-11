import { test, expect } from '@playwright/test';

test('Home page loads the hero text correctly', async ({ page }) => {
    // 1. Navigate to the home page
    await page.goto('http://localhost:3000/');

    // 2. Locate the specific heading text
    // We use a regex /.../i to make it case-insensitive for better stability
    const heroHeading = page.getByText(/Bringing Data Together/i);

    // 3. Assert it is visible
    await expect(heroHeading).toBeVisible();

    // 4. Optional: Check that the "Explore" or "Get Started" button is also there
    // This ensures the main navigation path is functional
    const exploreLinkS = page.locator('nav, div').getByText(/SocioMap/i).first();
    await expect(exploreLinkS).toBeVisible();
    const exploreLinkM = page.locator('nav, div').getByText(/ArchaMap/i).first();
    await expect(exploreLinkM).toBeVisible();
});