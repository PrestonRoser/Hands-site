import { describe, expect, it } from 'vitest';
import type { Kit, PurchaseChannel } from '../../src/lib/catalog';
import { getPurchaseAction, getQuoteAction } from '../../src/lib/commerce';

/**
 * Only the fields `commerce.ts` reads are set. Casting keeps the fixture honest
 * about that rather than inventing a full kit record that implies wider coverage.
 */
function kitWith(
  channel: PurchaseChannel,
  overrides: Partial<Kit['purchase']> = {},
  sku = 'HANDS-TEST-001',
): Kit {
  return {
    sku,
    purchase: {
      channel,
      stripePriceId: null,
      quoteAvailable: true,
      ...overrides,
    },
  } as Kit;
}

describe('getPurchaseAction', () => {
  it('sends Etsy kits to their listing, in a new tab', () => {
    const action = getPurchaseAction(
      kitWith('etsy', { etsyUrl: 'https://www.etsy.com/listing/123' }),
    );

    expect(action.kind).toBe('buy');
    expect(action.label).toBe('Buy on Etsy');
    expect(action.href).toBe('https://www.etsy.com/listing/123');
    expect(action.external).toBe(true);
    expect(action.note).toMatch(/Etsy storefront/);
  });

  it('falls back to the storefront when a kit has no listing URL', () => {
    const action = getPurchaseAction(kitWith('etsy'));

    expect(action.href).toBe('https://sproutforge3d.etsy.com');
    expect(action.external).toBe(true);
  });

  it('builds a first-party checkout URL from the SKU, not from a price', () => {
    // The SKU is the only thing that reaches the server. A client-supplied
    // amount must never be what checkout charges.
    const action = getPurchaseAction(kitWith('stripe', {}, 'HANDS DNA/001'));

    expect(action.href).toBe('/api/checkout?sku=HANDS%20DNA%2F001');
    expect(action.external).toBe(false);
    expect(action.href).not.toMatch(/price|amount/i);
  });

  it('routes quote-only kits to the contact form', () => {
    const action = getPurchaseAction(kitWith('quote'));

    expect(action.kind).toBe('quote');
    expect(action.href).toBe('/contact?topic=quote');
    expect(action.external).toBe(false);
  });

  it('offers a pilot instead of a purchase for unavailable kits', () => {
    const action = getPurchaseAction(kitWith('none'));

    expect(action.kind).toBe('notify');
    expect(action.href).toBe('/contact?topic=pilot');
    expect(action.label).toBe('Join a pilot');
  });
});

describe('getQuoteAction', () => {
  it('returns a quote link when the kit allows quotes', () => {
    expect(getQuoteAction(kitWith('etsy'))?.href).toBe('/contact?topic=quote');
  });

  it('returns nothing when the kit does not', () => {
    expect(getQuoteAction(kitWith('none', { quoteAvailable: false }))).toBeNull();
  });
});
