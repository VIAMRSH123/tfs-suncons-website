# Logo Intro — Notes

Built 25 October 2026 on `feat/journey-hero`, alongside the journey hero (`11-journey-hero.md`).
Like the other handovers, this says what was verified and what was not.

---

## 1. What it is

The first thing a visit sees. On ivory, a gold rule draws out from the centre, the TFS logo rises
from it out of a soft blur, a glint of warm light crosses the logo, and a line settles beneath:
"Rice · Spices · Pulses — Doha, Qatar". Then the curtain parts along the rule, top and bottom
halves sliding away, while the logo flies up into the header and becomes the header's own logo.
The journey's world settles back from a slight zoom as it is uncovered.

It plays **once per tab** on load, and **every time the header's logo is clicked**: the logo
flies out of the header to the centre as the curtain closes over the page, the home page loads
underneath, and the curtain opens onto it.

| Moment | First load | Logo click |
|---|---|---|
| Curtain | already closed at first paint | closes over the page, 750 ms |
| The mark | rule 120–820 ms · logo rises 320–1320 ms · glint 850–1650 ms | logo flies in from the header |
| Opens | at 1.6 s, over 1 s | once home is in, at least 700 ms after covering |
| Total | about 2.6 s | about 2.4 s |

## 2. How it behaves

- **Never delays the page.** The page loads and animates underneath exactly as it would without
  the intro, so the largest contentful paint is not held back. (An earlier version held the hero's
  pieces until the curtain opened; on a phone the lead paragraph is the largest text, and LCP rose
  from 0.17 s to 2.6 s. Holding nothing fixed it.)
- **Skippable.** A scroll, tap, click or key press during the wait opens it in 550 ms.
- **Once per tab.** `sessionStorage` (`tfs-intro-seen`) remembers it; a reload doesn't replay it,
  a new tab does. Blocked storage means it may play again — never that it breaks.
- **Off where it should be.** Not with `prefers-reduced-motion` (the logo then navigates plainly),
  not in a background tab, not without JavaScript (nothing is ever shown).
- **First paint, before any script.** A tiny inline script in `<head>` decides whether it plays,
  marks `<html data-intro>` and preloads the logo — only then. The entrance is pure CSS; React
  only drives what follows.
- **Failsafe.** If the page's scripts never arrive, the boot script lifts the intro after 7 s.
- **Modified clicks are left alone.** ⌘/Ctrl/Shift/Alt-click and middle-click on the logo still
  open a new tab or window. A logo click also closes the mobile menu.

## 3. Where it lives

| Piece | File |
|---|---|
| Timings, the logo's flight maths (FLIP), the click filter, the header's hook, the boot script | `src/lib/intro.ts` (+ `intro.test.ts`, 13 tests) |
| The overlay and the choreography after first paint (Web Animations API) | `src/components/intro/LogoIntro.tsx` |
| The entrance keyframes, the veil, the glint mask | `src/styles/intro.css` |
| The world's settle | `src/styles/journey.css` |
| The boot script, `suppressHydrationWarning` on `<html>` | `src/app/layout.tsx` |
| `data-site-logo` and the click hand-off | `src/components/layout/Header.tsx` |
| End-to-end checks | `e2e/logo-intro.spec.ts` (5 tests) |

The logo is used raw (`/brand/tfs-logo-light.png`) as a CSS background, because the glint's mask
needs the same file; one download, preloaded by the boot script, serves both.

## 4. Verified

- First load at 1440 and 375, frame by frame: the phases run in order, the header's logo is hidden
  until the hand-over and shown after, the headline is visible, no console errors or warnings.
- Reload in the same tab: no intro. Key press: gone 0.6 s later. Reduced motion: no intro, and the
  logo navigates home plainly.
- Logo click from `/products`: covers, lands on `/`, scrolled to the top, opens, hands over.

## 5. Not verified

- **Real devices**, iOS Safari above all (the mask and the WAAPI flight are standard, but untested
  there), and slow phones, where hydration may land after the 1.6 s mark — the mark then simply
  holds until the page is ready, as a preloader should.
- **A Content Security Policy** would need a nonce or hash for the inline boot script
  (`06-handover.md` still lists the CSP as not added).
