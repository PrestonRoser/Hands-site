import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';

/**
 * The catalog data-access layer.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 * ---------------------------------------------------------------------------
 * Today the HANDS catalog is a handful of JSON files in `src/content/`. Eventually
 * it will be rows in the platform database, served by `api.handslearning.com`.
 *
 * This module is the *only* place that knows which of those is true. Page and
 * component code imports `listKits()` / `getKit()` and receives plain `Kit` and
 * `Lesson` objects whose shape is defined here, not by Astro's content collections.
 * When the catalog moves to the database, every change lands inside this file:
 *
 *   1. Replace the body of `loadKits()` / `loadLessons()` with a fetch against the
 *      catalog endpoint.
 *   2. Update `toKit()` / `toLesson()` to map the API payload onto the same types.
 *   3. Delete `src/content.config.ts` and the JSON files.
 *
 * No `.astro` file should need to change. That is the whole point — keep the swap
 * to a single, reviewable diff instead of a site-wide refactor.
 *
 * ---------------------------------------------------------------------------
 * THE ONE THING TO WATCH WHEN SWAPPING
 * ---------------------------------------------------------------------------
 * Images. Local files go through Astro's build-time optimizer and arrive as
 * `ImageMetadata`; database-served images will be remote URL strings. `ImageSource`
 * below is already a union of both, and every consumer handles both cases, so the
 * transition does not break rendering. Remote hosts must be added to
 * `image.domains` / `image.remotePatterns` in `astro.config.mjs` at that time.
 *
 * Rendering is static: this data is read at build time, so a catalog change means a
 * rebuild. When the database becomes the source of truth, either keep that (rebuild
 * on a content webhook) or move these routes to on-demand rendering.
 */

export type ImageSource = ImageMetadata | string;

export type KitStatus = 'available' | 'preorder' | 'in_development' | 'archived';
export type PurchaseChannel = 'etsy' | 'stripe' | 'quote' | 'none';

export interface Money {
  amount: number | null;
  currency: string;
}

export interface Range {
  min: number;
  max: number;
}

export interface KitImage {
  src: ImageSource;
  alt: string;
}

export interface PurchaseInfo {
  channel: PurchaseChannel;
  etsyUrl?: string;
  stripePriceId: string | null;
  quoteAvailable: boolean;
}

export interface Kit {
  /** URL slug. Derived from the filename today, from a `slug` column later. */
  slug: string;
  sku: string;
  name: string;
  tagline: string;
  summary: string;
  status: KitStatus;
  price: Money | null;
  purchase: PurchaseInfo;
  images: KitImage[];
  subjects: string[];
  gradeBands: string[];
  ageMin: number | null;
  groupSize: Range | null;
  activityMinutes: Range | null;
  standards: string[];
  includes: string[];
  materials: string[];
  teaches: { term: string; detail: string }[];
  learningOutcomes: string[];
  deepDive: { title: string; body: string; accent: 'mint' | 'sand' | 'coral' | 'azure' }[];
  audience: string[];
  lessonSlugs: string[];
  featured: boolean;
  order: number;
  /** Canonical site path for this kit. */
  href: string;
}

export interface Lesson {
  slug: string;
  title: string;
  summary: string;
  order: number;
  kitSlug: string;
  activityMinutes: Range | null;
  standards: string[];
  outcomes: string[];
  /** `gated` lessons are unlocked by a school license on the HANDS platform. */
  access: 'gated' | 'public';
  advanced: boolean;
}

/* -------------------------------------------------------------------------- */
/* Source adapters — the swap point                                           */
/* -------------------------------------------------------------------------- */

function toKit(entry: CollectionEntry<'kits'>): Kit {
  const d = entry.data;
  return {
    slug: entry.id,
    sku: d.sku,
    name: d.name,
    tagline: d.tagline,
    summary: d.summary,
    status: d.status,
    price: d.price,
    purchase: d.purchase,
    images: d.images,
    subjects: d.subjects,
    gradeBands: d.gradeBands,
    ageMin: d.ageMin,
    groupSize: d.groupSize,
    activityMinutes: d.activityMinutes,
    standards: d.standards,
    includes: d.includes,
    materials: d.materials,
    teaches: d.teaches,
    learningOutcomes: d.learningOutcomes,
    deepDive: d.deepDive,
    audience: d.audience,
    lessonSlugs: d.lessons.map((l) => l.id),
    featured: d.featured,
    order: d.order,
    href: `/kits/${entry.id}`,
  };
}

function toLesson(entry: CollectionEntry<'lessons'>): Lesson {
  const d = entry.data;
  return {
    slug: entry.id,
    title: d.title,
    summary: d.summary,
    order: d.order,
    kitSlug: d.kit.id,
    activityMinutes: d.activityMinutes,
    standards: d.standards,
    outcomes: d.outcomes,
    access: d.access,
    advanced: d.advanced,
  };
}

/** Replace with a catalog API call when the platform owns this data. */
async function loadKits(): Promise<Kit[]> {
  const entries = await getCollection('kits');
  return entries.map(toKit).sort((a, b) => a.order - b.order);
}

/** Replace with a catalog API call when the platform owns this data. */
async function loadLessons(): Promise<Lesson[]> {
  const entries = await getCollection('lessons');
  return entries.map(toLesson).sort((a, b) => a.order - b.order);
}

/* -------------------------------------------------------------------------- */
/* Public API — what pages and components call                                */
/* -------------------------------------------------------------------------- */

export interface KitQuery {
  /** Omit to include every status. */
  status?: KitStatus | KitStatus[];
  featured?: boolean;
  subject?: string;
  gradeBand?: string;
}

export async function listKits(query: KitQuery = {}): Promise<Kit[]> {
  let kits = await loadKits();

  if (query.status) {
    const allowed = Array.isArray(query.status) ? query.status : [query.status];
    kits = kits.filter((k) => allowed.includes(k.status));
  }
  if (query.featured !== undefined) {
    kits = kits.filter((k) => k.featured === query.featured);
  }
  if (query.subject) {
    kits = kits.filter((k) => k.subjects.includes(query.subject!));
  }
  if (query.gradeBand) {
    kits = kits.filter((k) => k.gradeBands.includes(query.gradeBand!));
  }
  return kits;
}

export async function getKit(slug: string): Promise<Kit | undefined> {
  const entry = await getEntry('kits', slug);
  return entry ? toKit(entry) : undefined;
}

/** The kit shown in the homepage feature band. Falls back to the first purchasable kit. */
export async function getFeaturedKit(): Promise<Kit | undefined> {
  const featured = await listKits({ featured: true });
  if (featured.length > 0) return featured[0];
  const available = await listKits({ status: 'available' });
  return available[0];
}

export async function listLessonsForKit(kitSlug: string): Promise<Lesson[]> {
  const lessons = await loadLessons();
  return lessons.filter((l) => l.kitSlug === kitSlug);
}

/** Every kit slug, for `getStaticPaths()`. */
export async function listKitSlugs(): Promise<string[]> {
  const kits = await loadKits();
  return kits.map((k) => k.slug);
}

/* -------------------------------------------------------------------------- */
/* Presentation helpers                                                       */
/* -------------------------------------------------------------------------- */

export function formatPrice(price: Money | null): string | null {
  if (!price || price.amount === null) return null;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currency,
  }).format(price.amount);
}

export function formatRange(range: Range | null, unit: string): string | null {
  if (!range) return null;
  return range.min === range.max
    ? `${range.min} ${unit}`
    : `${range.min}–${range.max} ${unit}`;
}

export function statusLabel(status: KitStatus): string {
  switch (status) {
    case 'available':
      return 'Available now';
    case 'preorder':
      return 'Pre-order';
    case 'in_development':
      return 'In development';
    case 'archived':
      return 'No longer available';
  }
}
