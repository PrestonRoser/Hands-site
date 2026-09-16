# Security policy

## Reporting a vulnerability

Email **sproutforged@gmail.com** with the details. Please include what you found, the URL
or file it affects, and the steps to reproduce it. We will acknowledge within 5 business
days.

Please do not open a public issue for a security problem, and please do not test against
real orders or other people's data.

This is a small team with no bug bounty program. We are grateful for reports regardless,
and will credit you when a fix ships if you would like us to.

## Scope

In scope:

- `handslearning.com` and its staging environment
- This repository, including the build and deploy configuration

Out of scope:

- Etsy, Formspree, and any other third party service we link to. Report those to the
  vendor directly.
- The learning platform (`app.handslearning.com`), which is a separate repository and has
  its own policy.

## What this site handles

The marketing site is static and deliberately stateless. It collects no student data, sets
no tracking cookies, and has no login.

The contact form posts to Formspree. Purchases currently go to an Etsy listing, so no
payment data touches this site.

When first-party checkout ships, payments will be handled by Stripe-hosted Checkout:
card details will be entered on Stripe's domain and never on ours, and no card data will
be stored, logged, or processed by this application. Stripe API keys will be Cloudflare
Worker secrets and will never appear in this repository, which is public.
