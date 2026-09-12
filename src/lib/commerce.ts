import type { Kit } from './catalog';

/**
 * Resolves how a visitor actually buys a given kit.
 *
 * ---------------------------------------------------------------------------
 * CURRENT STATE: Etsy only
 * ---------------------------------------------------------------------------
 * There is no Stripe account yet, so every purchasable kit routes to its Etsy
 * listing. The `stripe` branch below is written and typed but inert.
 *
 * ---------------------------------------------------------------------------
 * SWITCHING TO FIRST-PARTY CHECKOUT
 * ---------------------------------------------------------------------------
 * When a Stripe account exists:
 *   1. Set `stripePriceId` on the kit record in `src/content/kits/*.json`.
 *   2. Change that kit's `purchase.channel` from `"etsy"` to `"stripe"`.
 *   3. Add the checkout endpoint the `stripe` branch already points at.
 * Etsy stays reachable as a secondary channel via the footer and the storefront
 * link, so flipping a kit to Stripe never strands the Etsy listing.
 *
 * Note for whoever builds step 3: the school platform licence is a *separate*
 * line item, never bundled into the kit price, and it is offered by an explicit
 * opt-in checkbox at checkout rather than by detecting whether the visitor is
 * signed in to the platform. The site is intentionally stateless and does not
 * read platform session state.
 */

export interface PurchaseAction {
  /** `null` when the kit cannot be bought yet. */
  kind: 'buy' | 'quote' | 'notify' | null;
  label: string;
  href: string;
  external: boolean;
  /** Short clarifier rendered under the button. */
  note?: string;
}

export function getPurchaseAction(kit: Kit): PurchaseAction {
  switch (kit.purchase.channel) {
    case 'etsy':
      return {
        kind: 'buy',
        label: 'Buy on Etsy',
        href: kit.purchase.etsyUrl ?? 'https://sproutforge3d.etsy.com',
        external: true,
        note: 'Orders are fulfilled through our Etsy storefront.',
      };

    // Wired, not yet active. See the note above before enabling.
    case 'stripe':
      return {
        kind: 'buy',
        label: 'Add to cart',
        href: `/api/checkout?sku=${encodeURIComponent(kit.sku)}`,
        external: false,
      };

    case 'quote':
      return {
        kind: 'quote',
        label: 'Request a quote',
        href: '/contact?topic=quote',
        external: false,
        note: 'Classroom and district pricing, POs and W-9 available.',
      };

    case 'none':
    default:
      return {
        kind: 'notify',
        label: 'Join a pilot',
        href: '/contact?topic=pilot',
        external: false,
        note: 'Not yet available. Pilot partners help shape what ships.',
      };
  }
}

/** Secondary action shown next to the primary buy button. */
export function getQuoteAction(kit: Kit): PurchaseAction | null {
  if (!kit.purchase.quoteAvailable) return null;
  return {
    kind: 'quote',
    label: 'Request an educator quote',
    href: '/contact?topic=quote',
    external: false,
  };
}
