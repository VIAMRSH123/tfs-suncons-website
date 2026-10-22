# Redesign Handover — TFS Suncons Website

Built 23 October 2026 from `09-page-by-page-plan.md`, with the research in `08-reference-sites.md`.
Like `06-handover.md`, this says plainly what was verified, what was measured, and what was not.
**Nothing is committed** — every change is in the working tree.

---

## 1. In one paragraph

The engine stayed (Next.js app, `products.ts` / `company.ts` as the only content source, routes,
redirects, JSON-LD, the enquiry API); the experience on top was rebuilt. Every page now has one
signature moment: the homepage opens on a **packing list that draws itself and resolves into the
real packs**; the range arrives as a **pack cloud that sorts itself by category on scroll**; the
four-state **grain morph** moved from About to tell the homepage journey; buyers can **plan an
order** and build an **enquiry basket** that reaches the VBP lead dashboard as structured lines;
product pages have a **pack inspector**; About keeps the **flag storm**; Contact shows **Doha's time,
live**; the 404's **91 mark scatters into grain**. The animation library is gone — the motion is
CSS — and first-load JS fell by 43–52 kB on every page.

## 2. Page by page

| Page | What it is now |
|---|---|
| `/` | Packing-list hero (rows from the catalogue; origins only as printed) · manifest band that follows scroll speed and direction · company intro + trade board · **pack cloud** (11 packs in depth → sorted into Rice / Spices / Pulses / Sugar) · pinned **rice index** with a live 01/07 counter · spices · **journey** (grain morph; the chapter beside it follows the grain) · the brand's watercolours · **order planner** · quality · enquiry with basket |
| `/products` | Counts generated from data ("Four categories, fifteen lines") · **catalogue PDF** card · category chips that live in the URL (`?c=rice`) · grids with "Add to enquiry" |
| `/products/rice` | Interactive **91 grain mark** in the masthead · grid · **grade guide** comparing all seven lines on printed fields only |
| `/products/spices` | **Colour study** — each pouch on its own field; text colours chosen by computed contrast |
| `/products/pulses` | **Type specimens** for the four unphotographed lines; the honest note leads the page |
| `/products/sugar` | A single feature layout instead of a one-item grid |
| `/products/*/*` (×15) | **Pack inspector** (lens measured against the drawn pack; full-screen view for touch and keyboard) · Add to enquiry · data sheet with **print stylesheet** · previous / next |
| `/about` | Flag storm given a wide masthead · long read with a **sticky chapter index** (scroll-spy, `aria-current`) · **reach diagram** that draws itself, captioned "an abstract diagram, not a map" |
| `/contact` | **Live Doha time** · an address plate (stylised, "not to scale", linking to Google Maps — no embed, no cookies) · details · enquiry with basket |
| `404` | The 91 mark in grain, scattering under the pointer and gathering again |
| `/catalogue.pdf` | New: the whole range as a trade-document PDF, **generated at build time from `products.ts`** (7 pages, 305 kB) |

## 3. Site-wide systems

- **Motion without a library.** Five verbs in `styles/motion.css` — rise, unmask, settle, draw,
  track. JavaScript only flags arrival (`data-revealed`) via IntersectionObserver; above-the-fold
  pieces are first-paint CSS animations, so heroes never wait for hydration. Pins use native
  `position: sticky` with heights set in CSS (no layout jump when scripts load). Cursor, magnets and
  pointer depth run on a ~40-line frame-rate-independent follower (`lib/follow.ts`). Canvases pause
  off screen. Reduced motion and no-JS both get final states (`<noscript>` rules in the layout).
- **Page transitions** — React's `<ViewTransition>` per page; the header holds still.
- **Surfaces** — paddy-terrace contour texture (a seamless 2.9 kB topographic tile generated with
  marching squares, used as a CSS mask), window light over packs, one colour grade and a
  background-tuned, forest-tinted shadow on every pack.
- **Enquiry basket** — `lib/basket.ts` (pure, tested) + a `useSyncExternalStore` store persisted to
  sessionStorage; "Add to enquiry" everywhere; header count; a tray that steps aside when the form
  is on screen. The API re-checks every line against the catalogue and uses the catalogue's names.
- **Footer as a bill of lading** — shipper, consignee ("You — the trade buyer reading this"),
  *place of delivery* (not "port", which would name a seaport TFS never has), notify party,
  description of goods, marks & numbers 91.

## 4. Website → VBP leads

- New VBP endpoint `POST /api/webhooks/website` (`backend/app/api/website.py`). Token-checked
  (`WEBSITE_ENQUIRY_TOKEN`, constant-time compare) **before** the body is parsed; closed (503) until
  configured. Website side: set `ENQUIRY_WEBHOOK_URL=<vbp>/api/webhooks/website` and
  `ENQUIRY_WEBHOOK_TOKEN` to the same secret.
- Structured fields go straight into the pipeline (`structured_fields`), skipping the text
  extractor — which would have cut "Qatar Product Traders" to "Qatar". The rep-style text is still
  stored as the raw record, **neutralised** so a dead-letter replay cannot turn visitor text into a
  status update of someone else's lead; and the website channel never applies status updates at all.
- **Verified over real HTTP**: the website's exact payload, posted to a throwaway backend instance
  (no `.env`, temporary database), created `L-10000` — source `website`, record state Valid, the
  full basket in remarks. 18 new backend tests; the full backend suite (138) passes.

## 5. Measured

| Check | Result |
|---|---|
| `npm run build` | ✅ 28 pages (27 + the static catalogue) |
| `tsc --noEmit`, `eslint .` | ✅ clean |
| `npm test` (new) | ✅ 41 tests — basket, planner, scroll maths, follower, flag cycle, enquiry resolution, catalogue PDF, count words, catalogue integrity |
| Backend `pytest` | ✅ 138 passed (18 new) |
| Enquiry API paths | ✅ valid → 503 until delivery is configured · unknown product → 422 · unpublished pack size → 422 · quantity 0 → 422 · honeypot → silent 200 |
| No horizontal overflow at 320 px | ✅ `/`, `/products`, `/products/rice`, `/products/spices`, `/about`, `/contact` (after the fix in §6) |
| Browser walkthrough | ✅ every signature moment exercised at 1440 and at the pane's mobile width; no console errors |

**First-load JavaScript** (gzipped, the scripts in each prerendered page, modern browsers; the same
script before and after; the below-the-fold chunks split out with `next/dynamic` load after
hydration starts and are not counted):

| Page | Before | After |
|---|---|---|
| `/` | 202.7 kB | **150.9 kB** |
| `/about` | 195.7 kB | **150.2 kB** |
| `/products` | 191.9 kB | **150.8 kB** |
| `/products/rice` | 191.9 kB | **148.8 kB** |
| `/products/rice/bharat-gate` | 191.9 kB | **151.1 kB** |
| `/contact` | 198.5 kB | **149.0 kB** |

Against the 150 kB budget: two pages under, four within 1.1 kB over. React, Next and the Turbopack
runtime alone are ~129 kB of every page; the rest is ~21 kB of site code. The last kilobyte would
cost a real feature (the header's basket count), so it was left.

## 6. Bugs found and fixed

1. `/products` said **"fourteen lines"**; the catalogue has **fifteen**. The copy is now generated.
2. `/contact` said "call during **business hours**" — no hours are published anywhere. Removed.
3. `/contact` said "the office and **the stock** are in the same place" — `01-company-facts.md`
   lists warehouse claims as unverifiable. Removed.
4. The trade board rendered **blank without JavaScript**. Cells now render their final characters.
5. On phones the rice track's width **leaked into the page** and widened the mobile layout viewport
   (the fixed header measured 1,280 px at a 320 px width). Fixed with `overflow-x: clip`, which
   keeps the desktop sticky pin working.
6. The enquiry tray wrapped onto three lines at 320 px. Tightened.

## 7. Deliberate departures from the plan

- **GSAP and Lenis removed entirely**, not "loaded per section". Lazy-loading GSAP for the pinned
  rice index would insert its pin-spacer after load and shift the page; native sticky with a CSS
  height does the same job with no shift, and saves the library on every page.
- The **products page** got URL-driven filters rather than a second pack cloud — the homepage
  already has one, and two would dilute it.
- **Compare** became the rice **grade guide** (all seven lines in one table) — rice is where grades
  matter, and a full table needs no selection UI.
- The Contact **map** is a stylised address plate, labelled "not to scale" — a drawn street map
  needs geodata we do not have, and an embed would add third-party scripts and cookies.
- The About **people & premises** section is not rendered: an empty "photos to come" block reads
  as unfinished on a live site. It returns when TFS sends photography.

## 8. Not done, or not verified

- **Phase 5 — the 3D flythrough** — not built; it was always your call after Phase 2.
- **Lighthouse** — not run: the production URL is still unconfirmed (the obvious `*.vercel.app`
  names 404, and the Vercel connection needs team re-authorisation).
- **Reduced motion at OS level, and a screen-reader pass** — not observed in this environment. The
  CSS and JS guards are in place; they have not been watched working.
- **CSP** — still not added (from `06-handover.md`).
- **Order planner container fill** — deliberately absent until TFS confirms the loads it quotes.
- **Live delivery** — the website's `/api/enquiry` returns 503 until `ENQUIRY_WEBHOOK_URL` is set.
- A **stale `next dev` from 19 Oct** is still running on port 3000 (not started this session); it
  serves the current code via HMR.

## 9. What TFS needs to supply

Unchanged from `06-handover.md` §8, with two additions: the **91 Parboiled pack** with
"PKG 04/2018 / EXP 03/2020" now also appears in the catalogue PDF, so the re-shoot matters more;
and the **sack weights and container loads** TFS quotes, for the planner's container line.
