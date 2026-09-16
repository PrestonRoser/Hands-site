import { describe, expect, it } from 'vitest';
import { formatPrice, formatRange, statusLabel } from '../../src/lib/catalog';

describe('formatPrice', () => {
  it('formats an amount in its currency', () => {
    expect(formatPrice({ amount: 49, currency: 'USD' })).toBe('$49.00');
  });

  it('returns null when there is no price yet', () => {
    // Kits sold through Etsy carry no price on this site, and the UI shows
    // "See price on Etsy" instead. A "$0.00" here would be a pricing error.
    expect(formatPrice(null)).toBeNull();
    expect(formatPrice({ amount: null, currency: 'USD' })).toBeNull();
  });
});

describe('formatRange', () => {
  it('renders a span with an en dash', () => {
    expect(formatRange({ min: 15, max: 45 }, 'minutes')).toBe('15–45 minutes');
  });

  it('collapses a range whose ends match', () => {
    expect(formatRange({ min: 4, max: 4 }, 'students')).toBe('4 students');
  });

  it('returns null when unset', () => {
    expect(formatRange(null, 'minutes')).toBeNull();
  });
});

describe('statusLabel', () => {
  it('gives every status a human label', () => {
    expect(statusLabel('available')).toBe('Available now');
    expect(statusLabel('preorder')).toBe('Pre-order');
    expect(statusLabel('in_development')).toBe('In development');
    expect(statusLabel('archived')).toBe('No longer available');
  });
});
