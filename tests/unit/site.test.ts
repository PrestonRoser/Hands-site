import { describe, expect, it } from 'vitest';
import { features, platformUrl, site } from '../../src/lib/site';

describe('site constants', () => {
  it('has a canonical URL with no trailing slash', () => {
    // SEO.astro builds canonical and Open Graph URLs from this. A trailing slash
    // here yields `https://handslearning.com//kits`.
    expect(site.url).toBe('https://handslearning.com');
    expect(site.url.endsWith('/')).toBe(false);
  });

  it('points Open Graph at a root-relative image', () => {
    expect(site.ogImage.startsWith('/')).toBe(true);
  });
});

describe('platformUrl', () => {
  it('joins the app origin with a path', () => {
    expect(platformUrl('/redeem')).toBe('https://app.handslearning.com/redeem');
  });

  it('keeps the platform behind its flag until the app exists', () => {
    // Flipping this to true surfaces sign-in links site-wide. It must stay false
    // while app.handslearning.com does not resolve, or the nav gains dead links.
    expect(features.platform.enabled).toBe(false);
  });
});
