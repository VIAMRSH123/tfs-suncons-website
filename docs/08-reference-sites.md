# Reference Sites — what "better than the Netlify build" takes

Researched 22–23 October 2026. Every site below was **opened live** in the in-app Chromium
browser (Apple M3 Pro, WebGL2 and WebGPU available) and its stack read from the page itself —
canvas engine tags, scripts, fonts, transfer size — not taken from gallery blurbs. Awards come
from the Awwwards listings, the FWA and Utsubo's 2026 Three.js roundup. Where I could not get
into a site, it says so.

---

## 1. The bar to beat — `tfsuncons.netlify.app`

Full measurements in the vault (`Processed/Premium website design - lessons from Disha Habitat.md`,
Study 2). In one paragraph: hand-written static site, **8 requests**, 68.5 kB CSS + 34.5 kB JS, no
framework. Its signature is a 2D canvas where rice grains pour down into the numeral **91**. Around
that: cross-document View Transitions, a marquee that follows scroll speed and direction, an
auto-advancing brand spotlight, a pack magnifier, green-tinted shadows, Doha local time.

| It beats us on | We already beat it on |
|---|---|
| Page-to-page transitions (we hard-cut) | JSON-LD (it has none) |
| Weight — 8 requests vs our 220.6 kB of JS | Contrast — its gold accent is 2.26:1 on cream |
| Things that respond continuously (marquee, spotlight) | A real enquiry API with validation |
| Pack presentation — tuned shadows, a magnifier | Tap targets (its are 37–40 px at 320 px) |

**The thing nobody has noticed:** our About page already has a *four-state* grain morph — 1,500
grains forming paddy rows → an ocean swell → the Doha skyline → the 91 mark with a wheat wreath.
Their homepage emblem is *one* state. Ours is more ambitious and it is hidden on `/about`.

**Where it is beatable:** it is a beautifully crafted brochure. No cinematic story, no product in a
real setting, no tool a buyer would actually use, and nothing three-dimensional.

---

## 2. The list — verified live

Ordered by how directly each one applies to TFS.

### 1 · Montfort — `mont-fort.com`
**Awwwards Site of the Month, Jun 2025 · Immersive Garden · three.js r169 + Lenis · 19,000 px**

A **global commodity trading group** — our category at a hundred times the scale. The name means
"strong mountain", so the hero *is* a mountain: a 3D peak in drifting cloud. Scrolling flies the
camera up through the cloud, and each division (Trading, Capital, Maritime, Energy) arrives as a
chapter inside the same scene ("Operating efficiently by leading with innovation").

- **Technique:** one persistent WebGL scene; scroll drives a camera; business lines are chapters.
- **For TFS:** the proof that a commodity trader can win with this. Our equivalent scene is the
  journey: paddy belt → river → port → sea → Doha. **Adapt.**

### 2 · Explore Primland — `explore.ownprimland.com`
**Awwwards Site of the Day, Feb 2026 · three.js r179 · ambient audio · ~6 MB**

An aerial flythrough of real Blue Ridge terrain — rivers, forest canopy, volumetric cloud the
camera descends through — with "In the heart of the Blue Ridge Mountains" resolving over the land.

- **Technique:** real terrain data, fog, scroll-driven camera path, a sound bed.
- **For TFS:** this is "From the rice belt to the Gulf" told cinematically — the Telangana paddy
  belt at dawn, following water to the coast, across the Arabian Sea to Doha at dusk. Real terrain
  data is freely available. The one genuinely big swing on this list. **Adapt (as section 07).**

### 3 · Oryzo — `oryzo.ai`
**Awwwards Site of the Month, Apr 2026 · Lusion · three.js r178 "modified by Lusion" · 4.6 MB**

A joke product (a cork coaster) presented like an Apple launch. It opens as the product's outline
drawn in **bézier construction lines** — Illustrator handles and all — which then resolve into a
photoreal 3D coaster on a cutting mat, lit by projected **gobo** window-light textures. Scrolling
dollies the camera back through a full desk still-life (pencil, knife, eraser) while a giant
wordmark fades into the scene.

- **Technique:** drawing → object reveal; gobo lighting; Z-depth camera scroll.
- **For TFS:** our concept is literally "a trade document made beautiful". A packing list or bill
  of lading that **draws itself, then resolves into the real photographed pack** is that concept as
  a hero. Gobo light costs nothing in 2D — a soft window-shadow texture over the pack photo.
  **Adapt (hero).** Do not copy the 3D product: we have no accurate model of a sack.

### 4 · Shopify, The Renaissance Edition — `shopify.com/editions/winter2026`
**Awwwards Site of the Month, Feb 2026 · Shopify Design · 685 kB · no WebGL**

Opens on black with Renaissance perspective geometry **drawing itself** in thin lines, then cuts to
warm parchment, a decorative swash-italic display serif (HWCigars) and a sticky **12-chapter index**
on the left that tracks your position.

- **Technique:** SVG line drawing, an era taken all the way into typography, a chapter index.
- **For TFS:** proof that Site of the Month does not need WebGL or weight — **685 kB** in total. The
  chapter index fits our numbered `01 / PORTFOLIO` sections exactly. **Use.**

### 5 · Floema — `floema.com/en`
**Awwwards Site of the Month, May 2026 · Bürocratik · 2D canvas · 3.4 MB**

A **B2B maker of physical products** (benches, bollards, signage) — closest to us in what it sells.
The products open as cut-outs floating at different depths in a warm off-white space, then the page
turns into full-bleed photographs of those products in real streets, with a floating **"Urban
Catalogue — Download now"** card.

- **Technique:** a product cloud; products shown in use; a persistent catalogue download.
- **For TFS:** all 11 packs floating in depth, then sorting into Rice / Spices / Sugar. A
  downloadable spec catalogue is exactly what a purchasing manager forwards. **Use.**

### 6 · Terminal Industries — `terminal-industries.com`
**Awwwards Site of the Month, Sep 2025 · REJOUICE · Rive + Lenis · 4 videos**

Freight-yard logistics software. A cinematic golden-hour truck hero, then an interactive **"Yard
Efficiency Calculator"**.

- **Technique:** cinematic B2B hero; a calculator as the conversion tool.
- **For TFS:** a **container-load / monthly-supply calculator** — "how many 35 kg sacks for 400
  covers a day", "what fits in a 20 ft container" — would be the most useful thing on the site, and
  it can feed the enquiry basket. **Use.**

### 7 · Lando Norris — `landonorris.com`
**Awwwards Site of the Year 2025 · OFF+BRAND · Webflow + three.js r174 · 170 kB first load**

A real portrait with a **3D wireframe helmet scan layered over it**, topographic race-line contours
as the brand texture, and giant marquee rows sliding in opposite directions behind a photo.

- **Technique:** photograph + 3D overlay; contour lines as texture; everything heavy lazy-loaded.
- **For TFS:** paddy-terrace **contour lines** are a natural brand texture for us. And Site of the
  Year shipped 170 kB up front — weight is a choice. **Adapt (texture, loading strategy).**

### 8 · Apple, AirPods Pro 3 — `apple.com/airpods-pro`
**The canonical product page · 0 canvases · 16 videos · 11 sticky containers · 2.4 MB**

Apple has moved off canvas image-sequences: the scroll now scrubs **`<video>` inside sticky
containers**, with very large plain headlines between them.

- **For TFS:** right technique, missing asset. Our product film is code-generated motion graphics
  (`motion-studio/films/tfs`, renders not on disk), not footage. Needs a 10-second real shot — rice
  pouring into a sack, or a sack turntable. **Later, once footage exists.**

### 9 · Why Zero — `why.zero.university`
**Awwwards Site of the Month, Sep 2026 · three.js r160 · 2.1 MB**

Scroll is captured by a 3D scene and your progress is shown as a **rolling odometer** counting down.

- **For TFS:** an odometer counting the distance from paddy to Doha as the journey scrolls. Only if
  the distance is real and verified — no invented numbers. **Optional.**

### 10 · Hubtown — `hubtown.co.in`
**Awwwards Site of the Day, Jun 2026 · Unseen Studio · three.js r179 · 20 MB**

An Indian real-estate developer: a glowing 3D monolith over reflective water, a sci-fi HUD with a
chapter index and a cursor label.

- **For TFS:** useful only as proof an Indian corporate will commission award-level work. The
  register is wrong — "neon on dark by default" is on our own list of AI tells — and it pulled
  **20 MB** before showing anything. **Avoid.**

### 11 · Voldog — `voldogfood.com`
**Awwwards Honorable Mention, Jun 2026 · WooCommerce + jQuery · 5 canvases**

A Greek pet-food shop. Its award comes from a motion layer sitting on an ordinary WordPress stack.

- **For TFS:** consumer register, little transfers. Listed so nobody re-researches it. **Skip.**

---

## 3. Could not get in (stated, not padded)

| Site | Why |
|---|---|
| **Igloo Inc** — Site of the Year 2024 | Never rendered: 25+ s, 12 MB, no canvas created, even with the pane visible |
| **Häagen-Dazs Factory Tour** — `haagen-dazs.co.jp/brand/special/hd-factory` | Got in past the sound gate; sat on "99 Loading" for 60+ s. The 35 → 85 → 99 counter is three fixed steps, not real progress. three.js r157, 14 videos |
| **Crav Burgers** — `cravburgers.shop` | Next.js + GSAP, our stack. Its loader waits for all 38 images; 2 had loaded after 20+ s |
| **Santioni Spirits** — Site of the Day, Oct 2026 | Behind an age gate. I did not attest on your behalf. Saw an engraved line-art emblem loader and the collection carousel |
| **Cartier Watches & Wonders** | Event microsite, now offline; the studio URL serves an empty shell |

---

## 4. What the sweep actually taught us

1. **The heaviest "crazy" sites routinely fail to show up.** Three never got past their own
   loading screens on a fast laptop, Oryzo needed ~15 s, Hubtown 20 MB. Rule for us: **no
   preloader gating content, ever.** Any WebGL enhances a page that already works without it.
2. **The winners use 3D for the world, not the product.** Montfort's mountain, Primland's terrain,
   Oryzo's desk. That resolves our own "no WebGL" decision in `05-design-direction.md`: it existed
   because we have no accurate model of a sack. **3D for paddy, sea and Doha; packs stay real
   photographs.** Same honesty rule, more ambition.
3. **Weight is a choice.** Shopify won Site of the Month at 685 kB; Lando Norris won Site of the
   Year with 170 kB on first load.
4. **Every top site takes one idea all the way.** Montfort is a mountain. Shopify is the
   Renaissance. Oryzo is a drawing becoming an object. The Netlify build is the 91. We need one.

---

## 5. Signature moments, for us to choose from

| | Idea | From | Cost | Needs |
|---|---|---|---|---|
| A | **Promote the grain morph to the homepage** | Ours, already built | Low | Nothing — it exists |
| B | **Packing list draws itself → the real pack** under window light | Oryzo + Shopify | Low–medium | Nothing new |
| C | **"Rice belt to the Gulf" flythrough** — one scene, scroll-driven camera, chapters | Primland + Montfort | High | Terrain data; a static fallback |
| D | **Container-load / supply calculator** feeding the enquiry basket | Terminal | Medium | TFS confirms sack and container figures |
| E | **Pack cloud → sorted into categories**, plus a spec catalogue download | Floema | Medium | A catalogue PDF |
| F | Journey **odometer** | Why Zero | Low | A verified distance |
| G | **Scroll-scrubbed footage** | Apple | Medium | Real footage — none exists yet |

My pick if I had to choose: **A now** (free), **B as the hero**, **C as the one big swing** for the
journey section, **D as the tool that makes buyers enquire.** That combination is something the
Netlify build cannot match on any axis — story, scale, usefulness — while staying faster than it
on first load.

## 6. Apply or redesign?

The engine is sound and should stay: the Next.js app, `products.ts` / `company.ts` as the only
content source, routes and redirects, JSON-LD, accessibility, the enquiry API. What should be
redesigned is **the experience on top**: the homepage narrative, the hero, the journey section and
how packs are presented. In short — **redesign the experience, keep the engine.** The decision that
is yours: which of A–G we build.

## 7. Asset asks this creates for TFS

- A 10-second real shot — rice pouring into a sack, or a sack on a turntable (for G)
- Products in use — a hotel kitchen, a supermarket shelf (for E)
- Facility and team photography (already the biggest open item in `06-handover.md`)
- Real sack weights and container capacities they quote (for D)
