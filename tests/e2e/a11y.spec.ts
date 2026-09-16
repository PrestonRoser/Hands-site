import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = [
  '/',
  '/kits',
  '/kits/dna-rna-assembly-kit',
  '/educators',
  '/founders',
  '/contact',
  '/404.html',
];

/**
 * WCAG 2.2 AA is the stated build standard for this site. Automated checks catch
 * roughly a third of real barriers — they are a floor, not a certificate.
 */
test.describe('accessibility', () => {
  for (const path of PAGES) {
    test(`${path} has no automatically detectable violations`, async ({ page }) => {
      await page.goto(path);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(
        results.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.help}`),
        `${path} accessibility violations`,
      ).toEqual([]);
    });
  }

  test('the skip link is the first thing a keyboard reaches', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const focused = page.locator(':focus');
    await expect(focused).toHaveAttribute('href', '#main');
  });
});
