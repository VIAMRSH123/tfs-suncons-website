import { expect, test, type Page } from "@playwright/test";
import { dwellProgress } from "../src/lib/journey";

const CHAPTER_COUNT = 5;

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
    const start = (Number.parseFloat(getComputedStyle(sticky).top) || 0) / viewport;
    const { top, height } = track.getBoundingClientRect();
    const span = height - (1 - start) * viewport;
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, window.scrollY + top - (start * viewport - target * span));
  }, progress);
}

const railButtons = (page: Page) =>
  page.getByRole("list", { name: "The journey, chapter by chapter" }).getByRole("button");

test.describe("journey hero, driven by the scroll", () => {
  test("the scroll hands the cargo from the truck to the ship", async ({ page }) => {
    await page.goto("/");
    await scrollJourneyTo(page, dwellProgress(3, CHAPTER_COUNT));

    await expect(railButtons(page).nth(3)).toHaveAttribute("aria-current", "step");
    await expect(page.locator('[data-cargo="sea"]')).toHaveCSS("opacity", "1");
    await expect(page.locator('[data-cargo="road"]')).toHaveCSS("opacity", "0");
  });

  test("choosing a chapter on the rail scrolls to it", async ({ page }) => {
    await page.goto("/");
    await railButtons(page).nth(4).click();

    await expect(railButtons(page).nth(4)).toHaveAttribute("aria-current", "step");
    await expect(page.locator('.journey-caption__card[data-active="true"]')).toContainText("On Qatar");
  });

  test.describe("on a phone", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("the stage holds under the header without widening the page", async ({ page }) => {
      await page.goto("/");
      await scrollJourneyTo(page, dwellProgress(1, CHAPTER_COUNT));

      await expect(railButtons(page).nth(1)).toHaveAttribute("aria-current", "step");
      const panel = await page.locator(".journey-stage__panel").boundingBox();
      expect(panel?.y).toBeCloseTo(72, 0);
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
