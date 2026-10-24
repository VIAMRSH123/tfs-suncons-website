# Journey Hero — Prototype Notes

Built 24–25 October 2026 on `feat/journey-hero`, from the hero evaluation (the motion review and the
Emons study). Like `10-redesign-handover.md`, this says plainly what was verified, what was measured,
and what was not. **Nothing is committed** — every change is in the working tree.

---

## 1. In one paragraph

The packing-list hero is replaced by one isometric world, drawn as a single server-rendered SVG: a
Telangana paddy field, the mill, the packing yard, the India quay, the sea, the Doha quay and the
city. **The visitor's scroll carries a gold cargo through it** — a truck down the road, a ship
across the sea, a van into Doha — while the camera travels with it and a five-chapter rail fills.
The diorama also **tips a few degrees toward the pointer**, or toward how a phone is held. The
headline paints first and never waits for the scene; with reduced motion the world holds still and
the rail becomes a stepper.

## 2. How it works

| Layer | What it does | Where |
|---|---|---|
| World | One SVG of the whole journey in a 2:1 isometric projection, rendered on the server and never re-rendered. Clay-like materials, gold reserved for TFS's cargo | `components/journey/JourneyWorld.tsx`, `IndiaScenes.tsx`, `QatarScenes.tsx`, `IsoShapes.tsx`, `Vehicles.tsx`, `lib/iso.ts` |
| Scroll | Desktop (≥ 768 px): the 300svh section pins a 100svh frame (copy and stage), so 200svh of scrolling runs field → Doha. Phones: the copy scrolls away, then the stage's panel holds under the 72 px header for 150svh | `styles/journey.css` (heights are CSS only) |
| Mapping | Each chapter gets a fifth of the scroll. The camera rests on its stop for the first 40 % (`DWELL`), so the caption can be read, then glides to the next stop with ease-in-out | `lib/journey.ts` → `journeyAt` |
| Cargo | Truck x 3 → 42 over chapters 1–3, ship 46.4 → 57 in chapter 4, van 67.4 → 77 in chapter 5, each at a constant speed, cross-fading at the quays over 3 % of the scroll | `lib/journey.ts` → `convoyAt`, `components/journey/Cargo.tsx`, `CARGO_LEGS` in `chapters.ts` |
| Frames | Per frame, only inline transforms: the camera's `translate3d`, the rail fills' `scaleX`, the cargo's `translate` and `opacity`. Writes are skipped when unchanged; React state changes only with the chapter. No CSS variable is written per frame | `JourneyStage.tsx` → `framePainter`, `driveByScroll` |
| Rail | Five buttons; `aria-current="step"` follows the scroll; choosing one scrolls smoothly to the middle of that chapter's dwell | `JourneyStage.tsx` |
| Tilt | Up to 3° and an 8 px lean toward a fine pointer, smoothed (about 0.6 s to settle), with a 5 % dead zone. On desktop it follows the pointer across the whole frame, headline included; it eases back when the pointer leaves the hero. Phones get half strength from `deviceorientation` where the browser sends readings unasked (Chrome and Firefox on Android). Nothing ever asks permission, so iOS gets no tilt | `components/journey/usePointerTilt.ts`, `lib/tilt.ts`, `styles/journey-tilt.css` |
| Portrait tablets | `(min-width: 768px) and (max-aspect-ratio: 4/5)`: the copy takes the top of the screen and the world plays out below it, instead of hiding behind the copy's fade | `styles/journey.css` |
| Reduced motion | No pin and a still world; the rail switches chapters instantly; the cargo is hidden and the ambient vehicles stand still in its place; no tilt. Switching the OS setting mid-visit changes mode on the spot | `JourneyStage.tsx`, `styles/journey.css` |
| No JavaScript | The `<noscript>` rule in `app/layout.tsx` undoes the scroll heights; the first frame shows, with the cargo truck at the field | `app/layout.tsx` |

## 3. Facts guardrails

Every caption traces to `01-company-facts.md` and the pack photographs:

| Chapter | Caption |
|---|---|
| 01 · Field | **Grown in Telangana** — 91 Telangana Gold names its origin on the sack: Telangana, Korutla. |
| 02 · Mill | **Milled and sorted** — 91 Telangana Gold and 911 Sona Masoori carry the Satake Japan 100% Sortex mark. |
| 03 · Packed | **Packed for the trade** — In 18, 20 and 35 kg sacks, several labelled in English, Telugu and Arabic. |
| 04 · Port & sea | **From India to Qatar** — Sourced in India and imported by TF Suncons, an importer and distributor in Doha. |
| 05 · Doha | **On Qatar's tables** — For retail, industrial and food-service buyers — hotels, restaurants and caterers among them. |

Nothing claims a fleet, a warehouse or a named port (the fact sheet lists those as unverifiable).
The trucks and the ship carry the product's journey, not TFS's assets. Gold marks the cargo and the
sacks only: the parked trucks at the mill and the India quay are sand-coloured.

## 4. Motion decisions

- **Scrubbed by the scroll, not played on a timer.** The visitor sets the pace, and nothing moves
  while they read — except the route's dashes, a constant linear flow paused off screen.
- **Ease-in-out for the camera's glides** (movement on screen); a soft scrub (0.14 per frame)
  smooths wheel steps without lagging behind the hand.
- **Captions cross-fade**: the outgoing card leaves in 160 ms, the new one arrives 120 ms later
  over 260 ms with the site's ease-out.
- **Rail buttons press to 0.97**; hover colour only on fine pointers.
- **The tilt is decoration, so it stays small** (3°, 8 px) and springs rather than snaps.
- **Reduced motion is gentler, not dead**: chapters still change, instantly, over a still world.

## 5. Measured

**First-load JavaScript** (gzipped; same method as `10-redesign-handover.md`):

| Page | Original hero (22 Oct) | Stepper prototype | Now |
|---|---|---|---|
| `/` | 150.9 kB | 152.3 kB | **154.7 kB** |
| Every other page | 148.8–151.1 kB | unchanged | **unchanged** |

The hero's own code is one home-only chunk of 6.9 kB; scroll and tilt added 2.4 kB to the stepper
prototype. Against the 150 kB budget, `/` is 4.7 kB over.

**HTML**: `/` is 61.7 kB gzipped (398.7 kB raw), up from about 23 kB with the original hero. The
world's SVG is sent twice — in the HTML and again in the RSC payload.

## 6. Verified

| Check | Result |
|---|---|
| `npm run build`, `tsc --noEmit`, `eslint` | ✅ clean |
| `vitest` | ✅ 94 tests, 53 of them new: `journey.test.ts` (21), `tilt.test.ts` (23), `iso.test.ts` (9) |
| Playwright (production build) | ✅ 5 tests, 4 new in `e2e/journey-hero.spec.ts`: the scroll hands the cargo from truck to ship; a rail click scrolls to its chapter; phones pin the stage under the header without widening the page; reduced motion is an unpinned stepper |
| Headless screenshots | ✅ 320×640, 375×812, 768×1024, 834×1194, 1024×768, 1024×1366, 1440×900 and 1920×1080, seven scroll positions each: chapters, rail and hand-overs land where expected; no console errors or warnings; no horizontal overflow |
| Reduced motion, no JavaScript | ✅ at 1440 and 375 |
| Tilt | ✅ pointer at 1440 (keeps following over the headline, clears on leaving the hero); phone attitude via synthetic `deviceorientation` events at 375 |

**Bugs found and fixed while integrating**

1. The phone tilt **never ran on Chromium**: the hook read `DeviceOrientationEvent.requestPermission`
   as a sign of a prompt, but Chromium defines it and grants it unasked. It now listens without
   asking, everywhere.
2. On **portrait tablets** the gold truck sat behind the copy's fade (768×1024). Fixed with the
   portrait layout in §2.
3. At the India quay hand-over, **two gold trucks** stood side by side. The parked ones are sand now.
4. The hero's section class **collided with the grain-morph section's** `.journey` (its desktop
   height leaked under reduced motion). Renamed `.journey-hero`.

## 7. Not done, or not verified

- **Real devices**: iOS Safari (sticky inside the hero's fading wrapper; the `(width < 768px)` range
  query needs Safari 16.4+), a real Android phone's tilt, Firefox and desktop Safari. Only Chromium
  was driven.
- **Frame rate on low-end phones.** The world is a large SVG; the camera is its own composited layer.
- **Landscape phones** (e.g. 844×390) get the desktop layout, whose 40rem minimum height pushes the
  caption and rail below the fold while pinned.
- **Lighthouse and a screen-reader pass** — not run (the production URL is still unconfirmed).

## 8. Decisions for you

1. **Two journeys on one page.** The grain-morph section further down tells the same field → sea →
   Doha story ("In the field", "The crossing", "Landfall", "The mark"). Keep both, or trim one.
2. **Ambient traffic is hidden while the scroll drives the hero**, because it shares the cargo's one
   lane and would drive through it. A second, oncoming lane would bring it back but needs mirrored
   vehicles. To restore the loops as they were, delete the first rule under "Motion in the world"
   in `styles/journey.css`.
3. **JS budget** (`/` is 4.7 kB over): accept it, or load the tilt only after hydration
   (about 1 kB).
4. **HTML weight**: draw repeated shapes once with `<symbol>`/`<use>`, or serve the still world as a
   static SVG file and keep only the cargo inline.
5. **`sections/Hero.tsx`** is no longer used. Delete it once the journey hero is accepted.
