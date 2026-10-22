# Page-by-Page Redesign Plan

Written 23 October 2026, from a read of every route and component in `src/`, the reference
research in `08-reference-sites.md`, and the measured study of the Netlify build.

**Assumption:** "redesign the experience, keep the engine". The Next.js app, `products.ts` /
`company.ts` as the only content source, routes, redirects, JSON-LD, accessibility and the enquiry
API all stay. If you would rather rebuild from scratch, §9 says what changes.

**The rule from the research:** every top site takes *one* idea all the way. So every page below
gets exactly one signature moment, and nothing else competes with it.

---

## 0. What exists today (inventory)

| Route | Count | Sections now |
|---|---|---|
| `/` | 1 | Hero · proof strip · company intro (+ trade board) · portfolio grid · rice index (pinned) · spices · journey (SVG arc) · quality · enquiry |
| `/about` | 1 | Hero (+ flag storm) · story (+ grain morph) · banner · mission & vision · reach & markets · CTA |
| `/products` | 1 | Hero · sticky category nav · 4 category grids · CTA |
| `/products/[category]` | 4 | Hero · grid · "no photography" note (pulses) · CTA |
| `/products/[category]/[slug]` | 15 | Pack + description · "On the pack" spec · related |
| `/contact` | 1 | Hero · address / phones / email · enquiry |
| `404` | 1 | Message · two CTAs · category links |

Catalogue: 7 rice, 3 spices, 4 pulses (no photography), 1 sugar = **15 products**, 11 pack images.

**Bugs found while reading — fix in Phase 1:**
- `/products` copy says *"Four categories, fourteen lines"*. The catalogue has **fifteen**. Compute
  the count from `products.ts` instead of hard-coding it.
- `/contact` says *"Call during business hours"*, but **no hours are published anywhere**. Either
  TFS confirms them or the line goes.

---

## 1. Site-wide — applies to every page (Phase 1)

| Change | Why | From |
|---|---|---|
| **No preloader, ever.** The static frame is the final state; motion plays over it | Three of the heaviest award sites never got past their own loaders | Research finding |
| **Page transitions** — cross-fade with the header held in place, off under reduced motion | We hard-cut between 27 pages; the Netlify build does not | Netlify build |
| **A fifth motion verb, "draw"** — hairlines and trade-document rules drawing themselves (SVG stroke) | The concept is "a trade document made beautiful"; drawing is how a document appears | Shopify Editions, Oryzo |
| **Pack treatment** — one colour grade, a tuned forest-tinted shadow per background, a soft window-light (gobo) overlay | Packs currently sit flat on white; this is the cheapest premium win on the list | Oryzo, Netlify build |
| **Paddy-contour texture** — fine terrace contour lines on dark sections | A brand texture that is ours, not a stock grain | Lando Norris |
| **Enquiry basket** — "Add to enquiry" on every product, a tray with a count in the header, structured `items[]` to the API and on to VBP | The conversion spine every page plugs into (Wave 1 of `07`) | — |
| **Footer as a bill of lading** — consignee, port of discharge Doha, the contact lines set as a closing document | Ends every page on the concept, and is not the Netlify build's giant wordmark | Our concept |
| **Performance** — drop Lenis; load GSAP per section; any 3D in its own chunk, loaded only near its section on capable devices | JS is 220.6 kB against a 150 kB budget today | `06-handover.md` |

**Per-page budget:** first-load JS ≤ 150 kB (lazy 3D excluded), LCP < 2.5 s on throttled 4G,
CLS < 0.1, AA contrast on every text token, nothing hidden without JavaScript.

---

## 2. Home `/`

**Job:** read *serious* in five seconds, *specific* in thirty, and leave with an enquiry started.
**Signature:** the packing list that becomes the packs.

| # | Section | Now | Plan |
|---|---|---|---|
| 01 | **Hero** | Three packs with cursor drift, "Quality that travels well." | **A packing list draws itself** — hairline rules, indexed rows (grade · weight · origin), each line real text — then the rows resolve into the three real packs under window light. Two CTAs. The final frame is server-rendered, so it is instantly correct; the drawing is the enhancement |
| 02 | Proof strip | Four static proof points | **A manifest band that answers the scroll** — the same four verified facts (Telangana origin, Satake sortex, 18 · 20 · 35 kg, EN · AR · TE labels), moving with scroll speed and direction |
| 03 | Company intro | Copy + trade board | **Keep** — the split-flap board is good. Tighten the copy around it |
| 04 | Portfolio → range | Four category panels | **Pack cloud** — all 11 packs floating at depth with cursor parallax; on scroll they settle and sort into Rice / Spices / Sugar, with Pulses as type. Replaces the grid |
| 05 | Rice index | Pinned horizontal, 7 packs | **Keep the pin**; the cloud lines up into it. New pack treatment, "Add to enquiry" on each card |
| 06 | Spices | Warm band, three pouches | **Keep**, with the pack treatment. No spice-dust particles — restraint here makes the journey land |
| 07 | **Journey** | SVG arc + watercolour vignettes | **The grain morph moves here from `/about`** — paddy rows → ocean swell → Doha skyline → 91 mark. Already built; currently hidden. *(Phase 5 option: the 3D flythrough replaces it on capable devices, and the grain morph becomes its fallback.)* |
| 08 | **Plan an order** (new) | — | **Container-load calculator** — product + monthly volume → sacks per month and container fill, adding the result to the enquiry basket. Ships only with figures TFS confirms |
| 09 | Quality | "What the pack already tells you" | **Keep**, plus a teaser of the pack inspector |
| 10 | Enquiry | Blank form | **Basket lines** listed above the message, posted as structured items |

## 3. About `/about`

**Job:** make a buyer trust the people behind the grain.
**Signature:** the flag storm — India's flag, made of rice, tearing into a storm and landing as Qatar's.

| Section | Plan |
|---|---|
| Hero | **Keep the flag storm**; it is the page's one idea. Give it more of the viewport |
| Story | An editorial long-read with a **sticky chapter index** — 01 The growing side · 02 Reach · 03 Doha today · 04 Mission & vision. The four existing paragraphs, unchanged in substance |
| Grain morph | **Moves to the homepage journey.** Two signature canvases on one page dilute both |
| Banner | Keep `about-banner.jpg` (a real brand asset), with the pack treatment |
| Reach | A restrained map lighting **only** India, Africa, Dubai and Qatar — the company's own words, no added countries, ports or routes |
| Mission & vision | Keep, quoted verbatim |
| People and premises | **Reserved** for facility and team photography — the biggest credibility upgrade, blocked on TFS. No stand-in imagery |

## 4. Products `/products`

**Job:** see the whole range at once and narrow it fast.
**Signature:** the pack cloud that sorts itself.

| Section | Plan |
|---|---|
| Hero | **The pack cloud as the hero.** Filter chips — Rice 7 · Spices 3 · Pulses 4 · Sugar 1, counted from data — send packs to their group |
| Filters | **In the URL** (`/products?c=rice`), so a filtered view can be sent to a colleague |
| Grid | Keep the alternating ivory/dark sections, with the new pack treatment and "Add to enquiry" |
| Compare | Up to three SKUs side by side on verified fields only, linkable |
| **Spec catalogue PDF** (new) | **Generated at build time from `products.ts`**, so it can never drift from the site. A floating "Download the catalogue" card. No TFS input needed |
| Copy | Fix "fourteen lines" (§0) |

## 5. Category pages `/products/rice · spices · pulses · sugar`

**Job:** go deep on one category.
**Signature:** each category's own material.

| Category | Plan |
|---|---|
| **Rice** (7) | A grain-scale hero — the 91 mark built from grain (reusing the grain canvas). A **grade guide**: 1121 basmati vs sona masoori vs parboiled, by use, on printed attributes only |
| **Spices** (3) | The three 1 kg pouches in their colours — turmeric, coriander, chilli — as a typographic colour study. Nothing claimed beyond the packs |
| **Pulses** (4) | No photography exists, so make the absence designed: **large type specimens** for chickpeas, white beans, green gram, kidney beans, and the existing honest note, made more visible. Highest-value photo ask to TFS |
| **Sugar** (1) | One product does not need a grid: a single feature layout that hands straight to the product page |

## 6. Product pages `/products/[category]/[slug]` (×15)

**Job:** answer "is this the grade I need?" and capture the enquiry.
**Signature:** the pack inspector.

| Section | Plan |
|---|---|
| Hero | Pack under window light with its tuned shadow; **magnifier** that knows where the pack sits inside its `object-fit: contain` box; full-screen inspect on touch; keyboard reachable |
| Enquiry | **Add to enquiry with pack size and quantity**, alongside the existing CTA |
| On the pack | Set as a **data sheet** in the trade-document style — and given a **print stylesheet**, because buyers print spec pages |
| Pager | **Previous / next product** within the category |
| Related | Keep |
| Pulses (no image) | Replace the "91 / Pack photography to follow" box with a designed **type specimen** of the product name |

## 7. Contact `/contact`

**Job:** reach a person, now.
**Signature:** Doha, live — local time beside the address.

| Section | Plan |
|---|---|
| Hero | "Industrial Area, Doha." with **live Doha time**. An open/closed state **only once TFS confirms hours** (§0) |
| Location | A drawn map of the Industrial Area with the pin, linking out to Google Maps — no embedded map, so no third-party scripts or cookies |
| Details | Keep the three columns; every number stays a working `tel:` link |
| Enquiry | With basket lines and the calculator's result, if any |

## 8. 404

**Job:** turn an old WordPress link into a product visit.
**Signature:** the 91 mark scatters into grains under the cursor and re-forms.

Keep "That page isn't on the shelf." Most bad links will be old WP URLs, so lead with the four
categories. Reuses the grain canvas; tiny cost.

---

## 9. Build order

| Phase | Scope | Unblocked? |
|---|---|---|
| **1** | Site-wide (§1) + the two bug fixes + the enquiry basket wired to VBP | Yes |
| **2** | Home: hero, manifest band, pack cloud → rice index, grain morph as journey | Yes |
| **3** | Products, categories, product pages: filters, compare, catalogue PDF, inspector, print | Yes |
| **4** | About, Contact, 404 | Yes (map and hours partly wait on TFS) |
| **5** | **Optional big swing:** 3D "rice belt to the Gulf" flythrough for the journey, on capable devices only | Your call after Phase 2 |
| **6** | QA: Lighthouse on the real URL, OS-level reduced motion, VoiceOver, screenshots at 320 → 1920, CSP | Needs the production URL |

**If you want a full rebuild instead:** Phases 2–4 become new components rather than upgrades, and
we lose the tested pieces (rice index pin, trade board, flag storm, grain morph, the enquiry API's
validation and honeypot) unless we port them. I would not: the engine is the part that is already
better than the Netlify build.

## 10. What I need from you, and from TFS

**You decide:** (1) keep the engine vs full rebuild, (2) whether Phase 5's 3D flythrough is in.

**TFS supplies:** business hours · the sack weights and container capacities they quote (for the
calculator) · pulses photography · facility and team photography · a re-shot 91 Parboiled pack ·
a 10-second real rice-pour shot (for an Apple-style scrubbed section later).

`05-design-direction.md` will need one line updated if Phase 5 goes ahead: 3D is allowed for the
world (terrain, sea, skyline), never for packaging.
