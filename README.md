# SiamDrive.vip

Premium private chauffeur, VIP airport Fast-Track and bodyguard concierge — Bangkok, Thailand.
Live: https://siamdrive.vip (GitHub Pages from `/docs`, proxied by Cloudflare).

## Structure
- `src/data.mjs` — single source of truth: brand, WhatsApp, **all prices** (supplier cost × `MARKUP`), vehicles, routes, airports, districts, experiences, services, journal slugs.
- `src/content/*.json` — page copy (routes, airports, airport-routes, districts, experiences, services, vehicles, faq, journal).
- `src/build.mjs` — static generator → `docs/` (pages, sitemap.xml, robots.txt, JSON-LD, redirects, IndexNow key).
- `static/` — css, js (site.js interactions, book.js booking wizard), vendor (GSAP, ScrollTrigger, Lenis), img, video. Copied to `docs/assets/`.
- `src/qa.mjs` — headless screenshots/console QA; `src/booktest.mjs` — booking wizard price test.

## Workflow
```
node src/build.mjs          # rebuild docs/
git add -A && git commit -m "..." && git push   # deploys via GitHub Pages
```
Change a price → edit `src/data.mjs` → rebuild. Every page, table, schema offer and the booking engine update together.
