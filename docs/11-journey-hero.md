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
| Scroll | The story is 15.6 units of beats; JourneyHero sets `--journey-units` from them. Desktop (≥ 768 px and at least 35rem tall): a one-screen frame (copy and stage) pins for 30svh of scroll per unit — about 4.7 screens, field → Doha. Phones: the copy scrolls away, then the stage's panel holds under the 72 px header for 22svh per unit — about 3.4 screens. Desktop windows under 35rem tall don't pin; the rail steps instead | `styles/journey.css` (heights are CSS only) |
| Pacing | A run of beats: every chapter **holds still** long enough to read its caption, then the camera **glides** on with the cargo, easing in and out. The sea crossing is the slowest glide (2.6 units): the camera sails with the ship, pauses as it docks in Doha, then follows the van into the city. The caption changes when the camera arrives at the next chapter's hold. Scroll smoothing (0.1 per frame) is the same at 60 and 120 Hz | `BEATS` in `chapters.ts`; `lib/journey.ts` → `buildTimeline`, `journeyAt` |
| Cargo | The truck drives with the camera and **stops at the mill and the yard**; at the India quay it hands the load to the docked ship and fades out; the ship crosses during the long glide; the van, waiting on the Doha quay, drives into the city. Vehicles ease between stops as the camera does, so the cargo stays in the shot | `CARGO` in `chapters.ts`; `lib/journey.ts` → `cargoAt`; `Cargo.tsx` |
| Frames | Per frame, only inline transforms: the camera's `translate3d`, the rail fills' `scaleX`, the cargo's `translate` and `opacity`. Writes are skipped when unchanged; React state changes only with the chapter. No CSS variable is written per frame. Where the pin starts and ends is measured again on every resize (a phone's toolbar hiding), without resetting the smoothing | `JourneyStage.tsx` → `framePainter`, `driveByScroll` |
| Rail | Five buttons; `aria-current="step"` follows the scroll; choosing one scrolls smoothly to the middle of that chapter's hold. On phones the labels are visually hidden but stay in each button's name, so screen readers and voice control hear "Field", not "01" | `JourneyStage.tsx` |
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
sacks only: the truck parked at the mill is sand-coloured, and the one that stood on the India quay
is gone — the cargo truck pulls up to the ship there itself.

## 4. Motion decisions

- **Scrubbed by the scroll, not played on a timer.** The visitor sets the pace, and nothing moves
  while they read. The route's dashes used to flow; they stay still now (§6, bug 5).
- **Holds between the glides.** Every chapter rests before anything moves on, and the long sea
  crossing gets the most scroll, so no chapter flashes past (VB's review, 25 Oct: "the ship moves
  too fast").
- **Ease-in-out for the camera's glides and the cargo's drives** (movement on screen); a soft scrub
  (0.1 per 60 fps frame, the same at 120 Hz) smooths fast flicks.
- **Captions cross-fade**: the outgoing card leaves in 160 ms, the new one arrives 120 ms later
  over 260 ms with the site's ease-out.
- **Rail buttons press to 0.97**; hover colour only on fine pointers.
- **The tilt is decoration, so it stays small** (3°, 8 px) and springs rather than snaps.
- **Reduced motion is gentler, not dead**: chapters still change, instantly, over a still world.

## 5. Measured

**First-load JavaScript** (gzipped; same method as `10-redesign-handover.md`):

| Page | Original hero (22 Oct) | Stepper prototype | Scroll + tilt | Now (paced, + logo intro) |
|---|---|---|---|---|
| `/` | 150.9 kB | 152.3 kB | 154.7 kB | **155.7 kB** |
| Every other page | 148.8–151.1 kB | unchanged | unchanged | **149.0–151.4 kB** |

The other pages carry only the header's 0.2–0.3 kB hook for the logo intro, whose own code loads
in a chunk after hydration starts (`12-logo-intro.md`). Against the 150 kB budget, `/` is 5.7 kB
over.

**HTML**: `/` is 61.9 kB gzipped (397.8 kB raw), up from about 23 kB with the original hero. The
world's SVG is sent twice — in the HTML and again in the RSC payload.

**Largest contentful paint** (headless Chromium, local production server): 0.24 s at 1440 and
0.41 s at 375 on a first visit with the logo intro; 0.17–0.20 s on a reload without it.

## 6. Verified

| Check | Result |
|---|---|
| `npm run build`, `tsc --noEmit`, `eslint` | ✅ clean |
| `vitest` | ✅ 119 tests, 78 of them new: `journey.test.ts` (28), `chapters.test.ts` (5 — the real story's data: every chapter holds on its own stop, glides move the camera, a gold vehicle is in the shot at every hold), `tilt.test.ts` (23), `iso.test.ts` (9), `intro.test.ts` (13) |
| Playwright (production build) | ✅ 10 tests, 9 new. `e2e/journey-hero.spec.ts` (4): the frame pins and the cargo passes from truck to ship mid-crossing; a rail click scrolls to its chapter; phones hold the stage under the header without widening the page; reduced motion is an unpinned stepper. `e2e/logo-intro.spec.ts` (5) — see `12-logo-intro.md` |
| Headless screenshots | ✅ 320×640, 375×812, 768×1024, 834×1194, 1024×768, 1024×1366, 1440×900 and 1920×1080, seven scroll positions each: chapters, rail and hand-overs land where expected; no console errors or warnings; no horizontal overflow. After the pacing rework, 12 moments along the beats at 1440 and 375: the active vehicle is in view at every one, and across the sea the ship holds a steady place on screen |
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
5. The route's dashes **flowed forever**, and the line spans the whole world, so every step
   repainted nearly all of it. Traced over 3 idle seconds: 9,936 raster tasks (4.1 s of raster
   work) and 358 paints at 1440; 1,620 raster tasks (0.8 s) and 360 paints at 375. Endless motion
   with no pause control also fails WCAG 2.2.2. The route is still now: 0 raster tasks and 24
   paints at both widths.
6. **The sea crossing raced past** (VB, 25 Oct). Every chapter had the same fifth of the scroll, but
   the camera's move from the India port to Doha is the longest by far, so the ship rushed and fell
   out of shot while the camera ran ahead. Rebuilt as beats: holds at every chapter, a slow crossing
   that follows the ship, a pause as it docks, then the van into the city; and more scroll overall.

**From the code review** (a separate reviewer agent; no critical or high findings)

7. On desktop windows **under 640 px tall** (a 1366×768 laptop with browser chrome) the pinned frame
   kept its 40rem minimum, so the rail sat below the fold for the whole pin. The pinned frame is now
   exactly one screen, and windows under 35rem don't pin at all.
8. Below 640 px the rail's **labels were `display: none`**, so its buttons were announced as "01"–"05".
   Now visually hidden instead, they stay in each button's name.
9. **Progress drifted** when a phone's toolbar hid: the pin's range was measured once, as a share of
   the viewport. It is now measured again after every resize, smoothing intact.
10. **Guards**: `journeyAt` and `cargoAt` read NaN progress as the start instead of throwing inside the
    frame loop; `resolveLength` refuses units it can't resolve, and the camera falls back to the
    centre rather than misplacing itself.
11. The scroll **smoothing settled twice as fast on 120 Hz screens** — it counted frames, not time.
    `lib/scroll.ts` now uses the follower's frame-rate-independent step (the rice index, pack cloud
    and grain morph share it, and gain the same fix).
12. The end-to-end tests now **prove the frame pins** (its top stays at 0 mid-story) and compare the
    phone's panel with the real header rather than a literal 72 px.

## 7. Not done, or not verified

- **Real devices**: iOS Safari (sticky inside the hero's fading wrapper; the `(width < 768px)` range
  query needs Safari 16.4+), a real Android phone's tilt, Firefox and desktop Safari. Only Chromium
  was driven.
- **Frame rate on low-end phones.** The world is a large SVG; the camera is its own composited layer.
- **Landscape phones** (e.g. 844×390) are under 35rem tall, so they get the stepper rather than the
  pin — checked in CSS and the stage's logic, not on a device.
- **Lighthouse and a screen-reader pass** — not run.

## 8. Decisions for you

1. **Two journeys on one page.** The grain-morph section further down tells the same field → sea →
   Doha story ("In the field", "The crossing", "Landfall", "The mark"). Keep both, or trim one.
2. **Ambient traffic is hidden while the scroll drives the hero**, because it shares the cargo's one
   lane and would drive through it. A second, oncoming lane would bring it back but needs mirrored
   vehicles. To restore the loops as they were, delete the first rule under "Motion in the world"
   in `styles/journey.css`.
3. **JS budget** (`/` is 5.7 kB over): accept it, or load the tilt only after hydration
   (about 1 kB), as the logo intro already does.
4. **HTML weight**: draw repeated shapes once with `<symbol>`/`<use>`, or serve the still world as a
   static SVG file and keep only the cargo inline.
5. **`sections/Hero.tsx`** is no longer used. Delete it once the journey hero is accepted.

## 9. The motion review it came from

The journey hero is Phase 3 of the motion review of 24 October 2026 (with the Emons study). Phases
1 and 2 — the site-wide fixes — are **not started**:

**Phase 1 · fix what's broken**
- [ ] Remove the custom cursor: it vanishes over forest sections, and four pointer-followers stack
  on the pack image. The `cursorLabel` props go with it (the journey hero's buttons pass them too).
- [ ] Press states: `scale: 0.97` on `:active` for buttons, chips, CTAs and the − / + stepper —
  the built CSS has none.
- [ ] `.link-underline` sits outside any cascade layer and overrides `transition-colors`: move it
  into `@layer components`, 150–200 ms.
- [ ] Product filter: a 700 ms `arrive` plus a smooth scroll on every chip → a 150 ms fade, and
  scroll only when the grid's top is off screen.
- [ ] The `<ViewTransition>` page cross-fade never runs in production: fix it (~200 ms) or delete it.
- [ ] The inspect dialog's backdrop isn't animated, so dark green flashes through: fade it with
  the dialog (~220 ms in, 150 ms out). The lens grows from `scale: 0.85` → 0.94 over 150 ms.

**Phase 2 · tighten repeated motion**
- [ ] Product-page entrances settle at 1.3 s → 400–500 ms, 8–12 px of travel.
- [ ] Enquiry tray 500 ms each way → ~250 ms in, 150 ms out; stagger the mobile menu 40 ms.
- [ ] Card image hover `scale-[1.05]` over 700 ms → `1.03`, ~300 ms in, 200 ms out.
- [ ] "Add to enquiry" → stepper: a 150–200 ms cross-fade with a 2 px blur, at a stable width.
- [ ] Magnetic buttons pull 14 px → 4–6 px.
- [ ] Reduced motion forces everything to 0.01 ms → keep fades of 150 ms or less; remove only
  movement, scaling and clipping.
- [ ] The scroll cue pulses forever → stop after three; add pause buttons to the manifest band and
  the flag storm (WCAG 2.2.2).
- [ ] `will-change` sits on every pack in the product cloud → only while that section is pinned.
