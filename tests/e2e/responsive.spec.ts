import { expect, test } from '@playwright/test';

const PAGES = ['/', '/kits', '/kits/dna-rna-assembly-kit', '/educators', '/404.html'];

/**
 * The homepage hero is a rotated, oversized image, and the kit page stacks
 * photos of differing aspect ratios. Both are easy ways to push the document
 * wider than the viewport on a phone, which is invisible on a desktop check.
 */
test.describe('layout holds at phone width', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const path of PAGES) {
    test(`${path} does not scroll horizontally`, async ({ page }) => {
      await page.goto(path);

      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth };
      });

      expect(
        overflow.scrollWidth,
        `${path} overflows by ${overflow.scrollWidth - overflow.clientWidth}px`,
      ).toBeLessThanOrEqual(overflow.clientWidth + 1);
    });
  }

  test('the hero image stays inside the viewport', async ({ page }) => {
    await page.goto('/');

    const box = await page.locator('.hero-art img').boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(-1);
    expect(box!.x + box!.width).toBeLessThanOrEqual(391);
  });
});
