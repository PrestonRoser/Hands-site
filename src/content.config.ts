import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Content collection schemas for the HANDS catalog.
 *
 * These schemas are deliberately shaped like database tables, not like page
 * content. Each field below is intended to survive the move from local JSON files
 * to rows served by the HANDS platform API — see `src/lib/catalog.ts`, which is the
 * single seam where that swap happens. Page components never read collections
 * directly; they call the catalog module, so changing the data source does not
 * touch a single `.astro` file.
 *
 * Rules for anything added here:
 *  - Public metadata only. Curriculum PDFs, videos, and answer keys are access-gated
 *    by the platform and must never be referenced from this repo.
 *  - No unannounced product details. A kit that has not been publicly launched gets
 *    a generic entry (see `engineering-kits-in-development`); specs, pricing, and
 *    component choices stay out of the public catalog until launch.
 */

const money = z.object({
  amount: z.number().nullable(),
  currency: z.string().default('USD'),
});

const range = z.object({
  min: z.number(),
  max: z.number(),
});

/**
 * How a kit can currently be bought.
 *
 *  - `etsy`   — live listing on the Etsy storefront (today's only real channel)
 *  - `stripe` — first-party checkout; wired but inert until a Stripe account exists
 *  - `quote`  — classroom/district purchase handled by the contact form
 *  - `none`   — not purchasable yet (in development)
 */
const purchase = z.object({
  channel: z.enum(['etsy', 'stripe', 'quote', 'none']),
  etsyUrl: z.string().url().optional(),
  /** Populated when first-party checkout goes live. Unused today. */
  stripePriceId: z.string().nullable().default(null),
  /** Whether educators can request a bulk/PO quote for this kit. */
  quoteAvailable: z.boolean().default(true),
});

const kits = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/kits' }),
  schema: ({ image }) =>
    z.object({
      sku: z.string(),
      name: z.string(),
      /** Short phrase under the product name. */
      tagline: z.string(),
      /** One-paragraph description used on cards, meta tags, and structured data. */
      summary: z.string(),
      status: z.enum(['available', 'preorder', 'in_development', 'archived']),
      price: money.nullable().default(null),
      purchase,
      /** First image is the primary/hero image. */
      images: z
        .array(
          z.object({
            src: image(),
            alt: z.string(),
          }),
        )
        .default([]),
      subjects: z.array(z.string()).default([]),
      gradeBands: z.array(z.string()).default([]),
      ageMin: z.number().nullable().default(null),
      groupSize: range.nullable().default(null),
      activityMinutes: range.nullable().default(null),
      standards: z.array(z.string()).default([]),
      /** What physically ships in the box. */
      includes: z.array(z.string()).default([]),
      materials: z.array(z.string()).default([]),
      /** Short "what this teaches" pills. */
      teaches: z.array(z.object({ term: z.string(), detail: z.string() })).default([]),
      learningOutcomes: z.array(z.string()).default([]),
      /**
       * Long-form narrative about classroom fit on the kit detail page.
       *
       * Do NOT describe individual activities here — per-activity narrative
       * belongs in the `lessons` collection, which renders as the "Included
       * learning" section. Describing the same activity in both places is how
       * the detail page ended up saying everything twice.
       */
      deepDive: z
        .array(
          z.object({
            title: z.string(),
            body: z.string(),
            accent: z.enum(['mint', 'sand', 'coral', 'azure']).default('azure'),
          }),
        )
        .default([]),
      audience: z.array(z.string()).default([]),
      /** Lesson slugs taught with this kit, in teaching order. */
      lessons: z.array(reference('lessons')).default([]),
      featured: z.boolean().default(false),
      order: z.number().default(100),
    }),
});

/**
 * Public lesson metadata only.
 *
 * The lesson *content* (PDFs, teacher guides, assembly video) is access-gated and
 * lives in the HANDS platform, unlocked by a school license. These records exist so
 * the public site can show what a kit teaches without exposing the materials.
 */
const lessons = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/lessons' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    order: z.number(),
    kit: reference('kits'),
    activityMinutes: range.nullable().default(null),
    standards: z.array(z.string()).default([]),
    outcomes: z.array(z.string()).default([]),
    /** `gated` lessons require a school license on the platform. */
    access: z.enum(['gated', 'public']).default('gated'),
    advanced: z.boolean().default(false),
  }),
});

export const collections = { kits, lessons };
