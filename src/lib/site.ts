/**
 * Single source of truth for brand constants, external links, and feature flags.
 *
 * Before this file existed, the Etsy URL, contact email, and Instagram handle were
 * copy-pasted across six components — and had already drifted (one component pointed
 * at an old `sproutforged` Instagram account that no longer matches the brand).
 * Import from here instead of hardcoding a URL in a component.
 */

export const site = {
  name: 'HANDS',
  /** Used for canonical URLs, sitemap, and absolute Open Graph image paths. */
  url: 'https://handslearning.com',
  tagline: 'Hands-on STEM kits for K-12 classrooms',
  description:
    'HANDS builds tactile, classroom-ready STEM kits that turn abstract science into something students can build with their hands. Teacher-ready activities, NGSS-aligned, designed with educators.',
  /** Default social preview image (1200x630), relative to the site root. */
  ogImage: '/images/og-default.jpg',
  logo: '/images/hands-logo-lossless.webp',
} as const;

export const contact = {
  email: 'sproutforged@gmail.com',
  instagram: 'https://www.instagram.com/hand.slearning/',
  instagramHandle: '@hand.slearning',
  /** Formspree endpoint backing the contact form. */
  formEndpoint: 'https://formspree.io/f/meorkyqz',
} as const;

export const channels = {
  /** Storefront landing page. */
  etsyStore: 'https://sproutforge3d.etsy.com',
} as const;

/**
 * Feature flags for surfaces that are built but not yet live.
 *
 * `platform.enabled` controls whether the site advertises the HANDS Learning
 * Platform (Sign in links, "Register your school" calls to action). It is false
 * until `app.handslearning.com` actually exists — flipping it to true is the only
 * change needed to surface those entry points site-wide, so there is no dead link
 * in the meantime.
 */
export const features = {
  platform: {
    enabled: false,
    appUrl: 'https://app.handslearning.com',
    signInPath: '/login',
    redeemPath: '/redeem',
  },
} as const;

export function platformUrl(path: string): string {
  return `${features.platform.appUrl}${path}`;
}
