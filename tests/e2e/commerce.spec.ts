import { expect, test } from '@playwright/test';

const KIT = '/kits/dna-rna-assembly-kit';

test.describe('purchase paths', () => {
  test('the buy button points at the Etsy listing and opens safely', async ({ page }) => {
    await page.goto(KIT);

    const buy = page.getByRole('link', { name: /Buy on Etsy/ }).first();
    await expect(buy).toHaveAttribute('href', /etsy\.com/);
    await expect(buy).toHaveAttribute('target', '_blank');
    // Without noopener the opened tab can navigate this one.
    await expect(buy).toHaveAttribute('rel', /noopener/);
  });

  test('educators can reach the quote form from the kit page', async ({ page }) => {
    await page.goto(KIT);

    await page
      .getByRole('link', { name: /educator quote/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/contact\?topic=quote/);
  });

  test('no checkout endpoint is exposed while Stripe is inert', async ({ page, request }) => {
    // commerce.ts has a wired-but-unused Stripe branch. Until it ships, nothing
    // should link to /api/checkout and the path should not resolve.
    await page.goto(KIT);
    await expect(page.locator('a[href*="/api/checkout"]')).toHaveCount(0);

    const response = await request.get('/api/checkout?sku=HANDS-DNA-001');
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('the price is never rendered as zero when unset', async ({ page }) => {
    await page.goto(KIT);
    const body = await page.locator('body').innerText();
    expect(body).not.toMatch(/\$0\.00/);
  });
});
