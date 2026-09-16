import { expect, test } from '@playwright/test';

test.describe('routing', () => {
  test('keeps the old /product URL working', async ({ page }) => {
    // Printed material and inbound links still point here.
    await page.goto('/product');
    await expect(page).toHaveURL(/\/kits\/dna-rna-assembly-kit\/?$/);
    await expect(page.locator('h1')).toContainText('DNA & RNA Assembly Kit');
  });

  test('serves the branded 404 for an unknown path', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');

    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toContainText('could not find that page');
    // The 404 must not be indexable.
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });

  test('every primary nav destination resolves', async ({ page, request }) => {
    await page.goto('/');

    const hrefs = await page
      .locator('header a[href^="/"], nav a[href^="/"]')
      .evaluateAll((links) =>
        Array.from(new Set(links.map((l) => (l as HTMLAnchorElement).getAttribute('href')!))),
      );

    expect(hrefs.length).toBeGreaterThan(3);

    for (const href of hrefs) {
      const response = await request.get(href);
      expect(response.status(), `${href} should resolve`).toBeLessThan(400);
    }
  });

  test('each page declares exactly one h1', async ({ page }) => {
    for (const path of ['/', '/kits', '/kits/dna-rna-assembly-kit', '/educators', '/founders']) {
      await page.goto(path);
      await expect(page.locator('h1'), `${path} should have one h1`).toHaveCount(1);
    }
  });
});
