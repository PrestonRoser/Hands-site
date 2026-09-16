import { expect, test } from '@playwright/test';

const KIT = '/kits/dna-rna-assembly-kit';

/**
 * The kit page gallery. Two of these assertions exist because of bugs found by
 * hand during the build: non-primary photos were lazy-loaded inside a hidden
 * container and so were still unfetched on first click, showing an empty frame;
 * and the outgoing photo was hidden instantly while the incoming one faded in,
 * flashing an empty frame on every swap.
 */
test.describe('kit photo gallery', () => {
  test('starts on the primary photo', async ({ page }) => {
    await page.goto(KIT);

    await expect(page.locator('.stage-item').first()).toHaveClass(/is-active/);
    await expect(page.locator('[data-thumb-index="0"]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('a thumbnail swaps the large photo and the swapped-in photo is actually visible', async ({
    page,
  }) => {
    await page.goto(KIT);

    const thumbCount = await page.locator('[data-thumb-index]').count();
    expect(thumbCount).toBeGreaterThan(1);

    await page.locator('[data-thumb-index="2"]').click();

    const active = page.locator('.stage-item.is-active');
    await expect(active).toHaveCount(1);
    await expect(active).toHaveAttribute('data-stage-index', '2');

    // Guards the empty-frame bug: the container being active is not enough, the
    // image inside it has to have loaded and be on screen.
    const image = active.locator('img');
    await expect(image).toBeVisible();
    await expect
      .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);

    await expect(page.locator('[data-thumb-index="2"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-thumb-index="0"]')).toHaveAttribute('aria-pressed', 'false');
  });

  test('selection resets on reload rather than persisting', async ({ page }) => {
    await page.goto(KIT);
    await page.locator('[data-thumb-index="1"]').click();
    await expect(page.locator('.stage-item.is-active')).toHaveAttribute('data-stage-index', '1');

    await page.reload();

    await expect(page.locator('.stage-item.is-active')).toHaveAttribute('data-stage-index', '0');
    await expect(page.locator('[data-thumb-index="0"]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('thumbnails are reachable and operable by keyboard', async ({ page }) => {
    await page.goto(KIT);

    const secondThumb = page.locator('[data-thumb-index="1"]');
    await secondThumb.focus();
    await expect(secondThumb).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page.locator('.stage-item.is-active')).toHaveAttribute('data-stage-index', '1');
  });
});
