import { test, expect } from '@playwright/test';

test.describe(() => {
  test.describe.configure({ retries: 2 });

  test('Wrong image validation', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    const title = page.locator('.navbar__inner .navbar__title');
    await expect(title).toHaveText('Playwright');
  
    await expect(page).toHaveScreenshot();
  });
});

