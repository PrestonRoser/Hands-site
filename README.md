# HANDS — handslearning.com

The public marketing and commerce site for **HANDS Learning**: tactile, classroom-ready
STEM kits for K-12. Built with Astro and Tailwind CSS, deployed on Vercel behind
Cloudflare DNS.

This repo is the brand and commerce layer. The authenticated learning platform
(curriculum delivery, rosters, progress) lives in a separate repo and will be served from
`app.handslearning.com`.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | [Astro](https://astro.build) (static output) |
| Styling | Tailwind CSS v4 + design tokens in `src/styles/global.css` |
| Content | Astro content collections (`src/content/`) |
| Fonts | Self-hosted Manrope + Inter (variable, woff2) |
| Hosting | Vercel, DNS via Cloudflare |

## Getting started

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static build into dist/
npm run preview    # serve the built site
```

## Project structure

```
src/
├── content/               # the catalog — see "Catalog" below
│   ├── kits/*.json        # one file per kit
│   └── lessons/*.json     # public lesson metadata (no gated material)
├── content.config.ts      # collection schemas (shaped like DB tables)
├── lib/
│   ├── catalog.ts         # data-access layer — the DB swap point
│   ├── commerce.ts        # purchase channel resolution (Etsy today)
│   └── site.ts            # brand constants, links, feature flags
├── components/
├── layouts/Layout.astro   # shell, SEO, skip link, fonts
├── pages/
│   ├── kits/index.astro   # catalog listing
│   └── kits/[slug].astro  # kit detail, generated per catalog entry
└── styles/global.css      # tokens, components, utilities
```

## Catalog

Kits and lessons are **data, not pages**. Adding a kit means adding one JSON file to
`src/content/kits/` — the listing page, detail page, homepage feature band, sitemap, and
structured data all pick it up automatically.

The catalog is deliberately structured to move to a database later. Page components never
read content collections directly; they call `src/lib/catalog.ts`, which returns plain
`Kit` and `Lesson` objects. When the platform API owns this data, only that one file
changes. See the comment block at the top of it for the migration steps.

Two rules for catalog content:

1. **Public metadata only.** Curriculum PDFs, teacher guides, and videos are access-gated
   by the platform and must never be referenced from this repo.
2. **No unannounced product details.** Kits that have not launched get a generic entry —
   no specs, pricing, or component choices before launch.

## Commerce

Purchases currently route to the Etsy listing. First-party Stripe checkout is wired but
inert until a Stripe account exists; see `src/lib/commerce.ts` for the three-step switch.

The platform licence is always a separate line item from kit hardware, never bundled into
the kit price.

## Feature flags

`src/lib/site.ts` has `features.platform.enabled`, which is `false` until
`app.handslearning.com` is live. Flipping it to `true` surfaces sign-in and
"register your school" entry points site-wide. Nothing links to the app while it is false.

## Images

Source images live in `src/assets/images/` and are optimized at build time into responsive
WebP. Keep sources web-ready (long edge ≤ 2400px) — full-resolution camera masters get
copied into the build output verbatim and bloat deploys.

Files in `public/` are served as-is and are not optimized: use it only for the favicon,
SVG icons, fonts, and the social preview image.

## Conventions

- Button hierarchy: `.btn-solid` (one per view) → `.btn-secondary` → `.btn-link`.
- Every page sets a title and description; `Layout` handles canonical, Open Graph, and
  Twitter tags.
- Pages using full-bleed `.band` sections must pass `contained={false}` to `Layout`.
- WCAG 2.2 AA is the build standard: visible focus, one `h1` per page, alt text on every
  image, no colour-only status.

## Deployment

Push to `main`; Vercel builds and deploys. Domain is managed in Cloudflare DNS with a CNAME
to `cname.vercel-dns.com`.

## Contributors

- **Preston Roser** — Co-founder, engineering
- **Esteban Gardea** — Co-founder, product and scientific lead

## License

MIT.
