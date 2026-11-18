import { expect, test, type Page } from "@playwright/test";
import { TIMELINE } from "../src/components/journey/chapters";
import { INTRO_SEEN_KEY } from "../src/lib/intro";
import { dwellProgress, progressAt } from "../src/lib/journey";

// These tests are about the hero, so the logo intro (e2e/logo-intro.spec.ts) is marked as already seen.
test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => sessionStorage.setItem(key, "1"), INTRO_SEEN_KEY);
});

/**
 * Scrolls so the journey reads `progress` (0–1): on desktop the pinned frame
 * travels through the hero section, on phones the stage's panel through the
 * stage — the same tracks JourneyStage follows.
 */
async function scrollJourneyTo(page: Page, progress: number) {
  await page.evaluate((target) => {
    const desktop = window.matchMedia("(min-width: 768px)").matches;
    const sticky = document.querySelector<HTMLElement>(desktop ? ".journey-frame" : ".journey-stage__panel");
    const track = sticky?.parentElement;
    if (!sticky || !track) throw new Error("journey hero not found");
    const viewport = window.innerHeight;
    const top = Number.parseFloat(getComputedStyle(sticky).top) || 0;
    const start = top / viewport;
    const end = (top + sticky.offsetHeight) / viewport;
    const rect = track.getBoundingClientRect();
    const span = rect.height + (start - end) * viewport;
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, window.scrollY + rect.top - (start * viewport - target * span));
  }, progress);
}

const railButtons = (page: Page) =>
  page.getByRole("list", { name: "The journey, chapter by chapter" }).getByRole("button");

/** The scroll driver is attached once it has written the camera's transform — before that, a click is lost. */
async function waitForScrollDriver(page: Page) {
  await expect
    .poll(() => page.locator(".journey-camera").evaluate((camera) => (camera as HTMLElement).style.transform))
    .not.toBe("");
}

test.describe("journey hero, driven by the scroll", () => {
  test("pins the frame and carries the cargo from the truck to the ship", async ({ page }) => {
    await page.goto("/");
    await waitForScrollDriver(page);
    // Halfway through the sea crossing (beat 7): still chapter 4, the truck gone, the ship under way.
    await scrollJourneyTo(page, progressAt(7.5, TIMELINE));

    await expect(railButtons(page).nth(3)).toHaveAttribute("aria-current", "step");
    await expect(page.locator('[data-cargo="road"]')).toHaveCSS("opacity", "0");
    await expect
      .poll(() => page.locator('[data-cargo="sea"]').evaluate((ship) => (ship as SVGGElement).style.transform))
      .not.toMatch(/^(|translate\(0px, 0px\))$/);
    const frame = await page.locator(".journey-frame").boundingBox();
    expect(frame?.y).toBeCloseTo(0, 0);
  });

  test("choosing a chapter on the rail scrolls to it", async ({ page }) => {
    await page.goto("/");
    await waitForScrollDriver(page);
    await railButtons(page).nth(4).click();

    await expect(railButtons(page).nth(4)).toHaveAttribute("aria-current", "step");
    await expect(page.locator('.journey-caption__card[data-active="true"]')).toContainText("On Qatar");
  });

  test.describe("on a phone", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("the stage holds under the header without widening the page", async ({ page }) => {
      await page.goto("/");
      await waitForScrollDriver(page);
      await scrollJourneyTo(page, dwellProgress(1, TIMELINE));

      await expect(railButtons(page).nth(1)).toHaveAttribute("aria-current", "step");
      const header = await page.locator("header").first().boundingBox();
      const panel = await page.locator(".journey-stage__panel").boundingBox();
      // The header is 72 px plus its 1 px bottom border, which overlaps the panel's top edge by design.
      const headerBottom = (header?.y ?? 0) + (header?.height ?? 0);
      expect(Math.abs((panel?.y ?? 0) - headerBottom)).toBeLessThanOrEqual(1);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  });
});

test.describe("journey hero with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("is a stepper over a still world, with nothing pinned", async ({ page }) => {
    await page.goto("/");
    const hero = await page.locator('section[aria-labelledby="hero-heading"]').boundingBox();
    const viewport = page.viewportSize();
    expect(hero && viewport && hero.height <= viewport.height * 1.25).toBe(true);
    await expect(page.locator(".journey-cargo")).toHaveCSS("display", "none");

    await railButtons(page).nth(2).click();

    await expect(railButtons(page).nth(2)).toHaveAttribute("aria-current", "step");
    await expect(page.locator('.journey-caption__card[data-active="true"]')).toContainText("Packed for the trade");
  });
});
