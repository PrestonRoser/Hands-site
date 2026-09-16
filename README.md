# HANDS — handslearning.com

The public marketing and commerce site for **HANDS Learning**: tactile, classroom-ready
STEM kits for K-12. Built with Astro and Tailwind CSS.

This repo is the brand and commerce layer. The authenticated learning platform
(curriculum delivery, rosters, progress) lives in a separate repo and will be served from
`app.handslearning.com`.

## Tech stack

| Layer     | Choice                                                     |
| --------- | ---------------------------------------------------------- |
| Framework | [Astro](https://astro.build) (static output)               |
| Styling   | Tailwind CSS v4 + design tokens in `src/styles/global.css` |
| Content   | Astro content collections (`src/content/`)                 |
| Fonts     | Self-hosted Manrope + Inter (variable, woff2)              |
| Node      | 22 (see `.nvmrc`)                                          |
| Hosting   | Vercel today; migrating to Cloudflare Workers              |

## Getting started

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # static build into dist/
npm run preview      # serve the built site
```

Before opening a pull request:

```bash
npm run check        # astro check — types and content schema
npm run format:check # prettier, same check CI runs
npm test             # vitest unit tests
npm run test:e2e     # playwright, against a production build
npm run build        # must pass
```

## Testing

| Layer         | Tool                                | What it covers                                  |
| ------------- | ----------------------------------- | ----------------------------------------------- |
| Unit          | Vitest (`tests/unit/`)              | Purchase routing, formatters, URL composition   |
| End-to-end    | Playwright (`tests/e2e/`)           | Gallery, routing, buy paths, phone-width layout |
| Accessibility | axe-core via Playwright             | WCAG 2.2 A/AA across seven pages                |
| Budgets       | Lighthouse CI (`lighthouserc.json`) | Performance, accessibility, best practices, SEO |

```bash
npx playwright install chromium   # once, before the first e2e run
npm run test:e2e
npm run test:lighthouse           # needs a build in dist/
```

Three deliberate choices:

- **End-to-end tests run against `astro preview`, not `astro dev`.** The dev server
  transforms modules on the fly, so it can pass while the built output — the thing that
  actually ships — is broken.
- **The preview port is 4327 and an existing server is never reused.** With Astro's
  default port and `reuseExistingServer`, a run silently adopted an unrelated project's
  dev server that held 4321 and tested the wrong site entirely.
- **Unit tests cover the pure logic in `src/lib/` only.** The catalog's data-access
  functions read real content, so they are exercised by the build and the end-to-end
  tests; mocking a content store would only assert that the mock works.

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
├── layouts/Layout.astro   # shell, SEO, skip link, fonts, icons
├── pages/
│   ├── 404.astro          # required for the edge 404 handler
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

When checkout does ship, it will use Stripe-hosted Checkout so no card data ever reaches
this application. See [SECURITY.md](SECURITY.md).

## Feature flags

`src/lib/site.ts` has `features.platform.enabled`, which is `false` until
`app.handslearning.com` is live. Flipping it to `true` surfaces sign-in and
"register your school" entry points site-wide. Nothing links to the app while it is false.

## Images

Source images live in `src/assets/images/` and are optimized at build time into responsive
WebP. Keep sources web-ready (long edge ≤ 2400px) and cropped to their subject — full
resolution camera masters get copied into the build output verbatim and bloat deploys.
Masters stay out of the repo.

Files in `public/` are served as-is and are not optimized: use it only for icons, fonts,
the web manifest, and the social preview image.

## Branches

Changes flow **`dev` → `qa` → `main`**:

| Branch | Purpose                                                |
| ------ | ------------------------------------------------------ |
| `dev`  | Integration branch. Feature branches merge here first. |
| `qa`   | Staging. What Esteban and pilot teachers review.       |
| `main` | Production.                                            |

Urgent fixes may branch as `hotfix/*` and target `qa` or `main` directly, then merge back
down. Every pull request uses the template in `.github/` and needs a review.

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org):
`feat(kits): …`, `fix(styles): …`, `chore(repo): …`.

## Conventions

- Button hierarchy: `.btn-solid` (one per view) → `.btn-secondary` → `.btn-link`.
- Every page sets a title and description; `Layout` handles canonical, Open Graph, and
  Twitter tags.
- Pages using full-bleed `.band` sections must pass `contained={false}` to `Layout`.
- WCAG 2.2 AA is the build standard: visible focus, one `h1` per page, alt text on every
  image, no colour-only status.
- This repository is **public**. No secrets, tokens, or `.env` contents in a commit.

## Deployment

Push to `main`; Vercel builds and deploys. Domain is managed in Cloudflare DNS with a CNAME
to `cname.vercel-dns.com`.

A migration to Cloudflare Workers is in progress — deploys will move to GitHub Actions with
`qa` and `main` mapping to separate Workers.

## Security

Report vulnerabilities per [SECURITY.md](SECURITY.md). Do not open a public issue.

## Contributors

- **Preston Roser** — Co-founder, engineering
- **Esteban Gardea** — Co-founder, product and scientific lead

## License

MIT.
