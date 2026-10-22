# Upgrade Plan — TFS Suncons Website

Written 22 October 2026, after inspecting a competing build of the same brand and re-reading this
repo. The goal is not "add more animation". The site already has a motion system. The goal is to
turn a very good brochure into **the thing a purchasing manager uses to decide and enquire**, and
to close the gaps `06-handover.md` left open honestly.

---

## 1. Where this build actually stands

From `06-handover.md`, measured on 18 Oct 2026 and not re-measured since:

- 27 pages, 26 static. `build`, `tsc --noEmit` and `eslint` all clean. 0 broken internal links,
  all 10 legacy WP URLs redirect, no horizontal overflow at any width 320–1920.
- CSS **8.7 kB**, fonts 83 kB, images 151.7 kB — all comfortably inside budget.
- **JS 220.6 kB against a 150 kB budget** — the one budget missed, and the handover says so plainly.
- Already built and not worth rebuilding: custom cursor with contextual labels, masked line
  reveals, clip-path image reveals, pinned/scrubbed rice index, magnetic CTAs, Lenis smooth
  scroll, the SVG sourcing arc, the About flag storm and grain morph, the split-flap trade board,
  JSON-LD for Organization/LocalBusiness/Product, a real enquiry API with honeypot and validation.

**Unconfirmed:** the production URL. `tfs-suncons.vercel.app`, `tfsuncons.vercel.app` and
`website-viamrsh.vercel.app` all return 404, and the Vercel MCP connection needs team
re-authorisation before it can list deployments. Confirm the live URL before anything in §5 is run.

## 2. The reference board

| Reference | How it was checked | What it proves |
|---|---|---|
| `tfsuncons.netlify.app` | Fully inspected 22 Oct 2026 — stylesheet, `main.js`, computed styles, contrast computed from tokens, tested at 320 px | A competing build of **our own brand**, hand-written, 8 requests, 68.5 kB CSS + 34.5 kB JS. Full write-up in the vault at `Processed/Premium website design - lessons from Disha Habitat.md`, Study 2 |
| `voldogfood.com` (Awwwards HM, Jun 2026) | Opened 22 Oct 2026 | Award-level motion sitting on top of an ordinary WooCommerce stack. The award is in the layer, not the platform — but it is a consumer shop, and its patterns do not transfer to B2B |
| `santionispirits.com` (Awwwards SOTD, Oct 2026) | Listing read, not opened | WebGL-led product storytelling. Confirms the register we deliberately rejected: we have no accurate 3D pack and will not invent one |
| `ldc.com`, `olamagri.com`, `tilda.com`, `bradmagroup.com.qa`, `royaldohatrading.com` | Opened 18 Oct 2026, recorded in `05-design-direction.md` | The B2B agri register, and the consumer register to avoid |

**What the Netlify build does that we do not.** Cross-document View Transitions on a static
multi-page site; a marquee whose direction and speed follow the scroll; a brand spotlight that
auto-advances and then yields permanently once the visitor interacts; a product magnifier that
accounts for `object-fit: contain`; brand-tinted shadows (`rgb(23 63 20 / .10)`, never grey); one
colour grade plus six per-context drop-shadows on cut-out packs; filters written to the URL; local
time in Doha on the contact page.

**Where we are already ahead.** It ships **no JSON-LD at all**; its light accents fail contrast
for anything but display type (gold `#d99a2b` on cream is **2.26:1**, green `#5c9a34` is
**3.18:1**, muted on sand **4.18:1**); its tap targets run 37–40 px at 320 px. Our tokens were set
by computing ratios, and every one of those is already fixed here.

---

## 3. Wave 1 — make the site do its job (highest value)

The site's job is to get a hotel buyer, supermarket category manager or catering wholesaler to
enquire with enough specificity that TFS can quote. Nothing below is decoration.

### 1.1 Enquiry basket → prefilled quote request
**The single highest-value change.** Today every enquiry starts from a blank message box.

- "Add to enquiry" on `ProductCard` and on each product detail page, carrying `slug`, pack size
  and a quantity input.
- A persistent, dismissible tray (count in the header), state in `sessionStorage` so a reload
  survives.
- `EnquirySection` reads the basket and renders the lines as a read-only summary above the
  message field, and posts them as a structured `items[]` array on the existing
  `POST /api/enquiry`.
- Files: `src/components/ui/ProductCard.tsx`, `src/app/products/[category]/[slug]/page.tsx`,
  `src/components/sections/EnquirySection.tsx`, `src/app/api/enquiry/route.ts` (extend the zod
  schema), plus a new `src/components/enquiry/` for the basket store and tray.
- **Why it matters beyond the website:** `06-handover.md` §9 already recommends pointing
  `ENQUIRY_WEBHOOK_URL` at the VBP lead backend. A structured `items[]` payload means a website
  enquiry lands on the VBP dashboard with the same shape as a WhatsApp lead, product and quantity
  included, instead of as free text someone has to re-read.
- **Done when:** a basket built across three pages arrives at the webhook as structured JSON, the
  honeypot still silently discards bots, and the whole flow works with JavaScript disabled down to
  the existing plain form.

### 1.2 Pack inspector on product detail
The pack *is* the spec sheet — grade, net weight, origin, the 91 mark are all printed on it, and
the renders are 1000×1000. Today it sits static in an `aspect-square` box.

- Hover/press to magnify, computing where the pack actually sits inside its `object-fit: contain`
  box before zooming (the Netlify build solves exactly this; the naive version magnifies empty
  padding).
- Touch: tap to open a full-screen inspect view. Keyboard: a real button that opens the same view.
- Files: new `src/components/ui/PackInspector.tsx`, used from
  `src/app/products/[category]/[slug]/page.tsx`.
- **Done when:** the magnifier never shows letterboxing, works by keyboard, and is inert under
  `prefers-reduced-motion` (the full-screen view still opens).

### 1.3 Grade comparison
Buyers choose between grades, and we have seven rice lines with real differences.

- Compare up to three SKUs on the fields already in `src/content/products.ts`; add nothing that
  isn't verifiable.
- Lives on `/products/rice`, state in the URL so a comparison is linkable to a colleague.
- **Done when:** a comparison URL opens with the same three products selected.

---

## 4. Wave 2 — the premium layer we are actually missing

### 2.1 Page transitions
27 pages that currently hard-cut between each other. The Netlify build shows a static multi-page
site feeling continuous with `@view-transition` and a persistent `view-transition-name` on the
header.

- Check this Next version's support first — `AGENTS.md` warns this Next is newer than training
  data, so read `node_modules/next/dist/docs/` rather than assuming the `experimental.viewTransition`
  flag behaves as documented elsewhere.
- Keep it to a cross-fade plus a held header. No arch wipe — that is their motif, not ours.
- Must be disabled under `prefers-reduced-motion`, as theirs is.

### 2.2 Treat the packs as photographed objects
Our direction doc says "product packs are photographed objects, not thumbnails in a card grid",
but the PNGs currently sit on flat white.

- One colour grade across all 11 renders, and a tuned `drop-shadow()` per background (ivory,
  paper, forest) so a pack never floats.
- Tint shadows with forest, not grey — `rgb(19 48 31 / .10)` reads as the same material as the page.
- This is a CSS-only change and the cheapest "premium" win on the list.

### 2.3 One element that answers the scroll
We have no marquee and nothing that responds continuously to input. A proof/tagline band whose
direction flips with scroll direction and whose speed follows scroll speed costs very little and
is the difference between "animated on arrival" and "alive".

- Put it between `ProofStrip` and `CompanyIntro`; content is the verified proof points, not slogans.

### 2.4 Signature brands spotlight — **decide, do not just add**
Their auto-advancing spotlight (progress bar, stops permanently once the visitor takes over, real
`role="tablist"`) is excellent, but we already have the pinned rice index doing a similar job
better for B2B. Recommendation: **do not duplicate it on the homepage.** Consider it only for
`/products` as the category landing device, and only if `RiceIndex` stays as-is.

---

## 5. Wave 3 — close the open items from the handover

These are named as unfinished in `06-handover.md` and are now the main risk to launch.

| # | Item | Action |
|---|---|---|
| 3.1 | **JS 220.6 kB vs 150 kB** | Dynamic-import GSAP + ScrollTrigger per section instead of app-wide; drop Lenis (the Netlify build has no smooth-scroll library and does not suffer); move the simple rise/stagger reveals to CSS scroll-driven animations where support allows, keeping GSAP only for the pinned rice index and cursor drift. Re-measure; do not claim the budget is met until it is |
| 3.2 | **No CSP** | Nonce-based policy via middleware, since Next injects inline scripts. `next.config.ts` already carries the other security headers |
| 3.3 | **Lighthouse never run** | Run it against the confirmed production URL, throttled. No score should be quoted anywhere until then |
| 3.4 | **Reduced motion never observed; no screen-reader pass** | Toggle it at OS level and walk the homepage, About (grain morph, flag storm) and a product page; then one VoiceOver pass over the enquiry flow |
| 3.5 | **Rate limiter is per-instance** | Fine on one instance; needs a shared store if the deployment scales |
| 3.6 | **Enquiry backend not connected** | Set `ENQUIRY_WEBHOOK_URL` to the VBP lead backend — do this *with* 1.1 so the structured payload lands somewhere real |

## 6. Wave 4 — small, cheap, human

- **Local time in Doha** in the footer or on `/contact`, with an open/closed state. One line of
  code; it makes a trading company read as staffed.
- **Product filters in the URL** on `/products`, so a filtered view is shareable.
- **A designed print stylesheet** for product detail pages — buyers print or PDF spec pages.
- Extend Product JSON-LD only where a field is genuinely published. The restraint already
  exercised here is correct; do not add price or availability.

---

## 7. Blocked on TFS (unchanged from handover §8)

Nothing in Wave 1–4 removes these, and item 3 is still the single biggest credibility upgrade
available:

1. Pulses photography. 2. A re-shot 91 Parboiled pack (the current render has "PKG 04/2018 / EXP
03/2020" legible on it). 3. **Facility and team photography.** 4. A vector logo. 5. Verified
social profiles. 6. A decision on the "Golden India / Golden Indian" and "Bharat / Bharath Gate"
inconsistencies. 7. Any certification actually held. 8. Unlisted SKUs.

## 8. Deliberately not doing

- **No WebGL / 3D pack.** Unchanged from `05-design-direction.md`: there is no accurate model and
  building one means inventing packaging.
- **No intro curtain.** The Netlify build has one. It costs first paint on a site whose job is to
  be read in five seconds by someone at work.
- **No second animation library, no UI kit, no icon package.**
- **No copying their arch motif or their palette.** Same brand, different authored system — the
  point of the "avoiding AI-looking websites" rule is that ours is derived from the 91 mark and
  the trade-document idea, and stays that way.

---

## Suggested order

1.1 → 3.6 (together, so enquiries land in VBP) → 1.2 → 2.2 → 3.1 → 3.2 → 3.3/3.4 → 1.3 → 2.1 →
2.3 → Wave 4.
