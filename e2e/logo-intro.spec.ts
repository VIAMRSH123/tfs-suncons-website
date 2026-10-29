import { expect, test, type Page } from "@playwright/test";
import { INTRO_SEEN_KEY } from "../src/lib/intro";

const html = (page: Page) => page.locator("html");
const headerLogo = (page: Page) => page.locator("[data-site-logo]");
const logoLink = (page: Page) => page.getByRole("link", { name: "TFS Suncons — home" });

/** The intro has handed over: the curtain is gone and the header's own logo shows. */
async function expectHandedOver(page: Page) {
  await expect(html(page)).not.toHaveAttribute("data-intro", /.*/, { timeout: 8000 });
  await expect(page.locator(".intro")).toBeHidden();
  await expect(headerLogo(page)).toHaveCSS("opacity", "1");
}

test.describe("logo intro", () => {
  test("plays on a visit's first paint, then hands its logo to the header", async ({ page }) => {
    await page.goto("/", { waitUntil: "commit" });
    await expect(html(page)).toHaveAttribute("data-intro", /load|exit/);
    await expect(headerLogo(page)).toHaveCSS("opacity", "0");

    await expectHandedOver(page);
    await expect(page.locator("#hero-heading")).toBeVisible();
  });

  test("stays away on a reload in the same tab", async ({ page }) => {
    await page.goto("/");
    await expectHandedOver(page);

    await page.reload({ waitUntil: "commit" });
    await expect(page.locator("#hero-heading")).toBeVisible();
    await expect(html(page)).not.toHaveAttribute("data-intro", /.*/);
  });

  test("gives way at once to a key press", async ({ page }) => {
    // Page time stands still, so the intro would wait forever: only the key press can open it.
    await page.clock.install();
    await page.clock.pauseAt(new Date(Date.now() + 1000));
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(html(page)).toHaveAttribute("data-intro", "load");
    await page.keyboard.press("ArrowDown");

    await expect(html(page)).not.toHaveAttribute("data-intro", /.*/, { timeout: 1500 });
  });

  test("plays again from the header's logo, on the way home", async ({ page }) => {
    await page.addInitScript((key) => sessionStorage.setItem(key, "1"), INTRO_SEEN_KEY);
    await page.goto("/products");
    await expect(html(page)).not.toHaveAttribute("data-intro", /.*/);

    await logoLink(page).click();

    await expect(html(page)).toHaveAttribute("data-intro", /cover|hold/);
    await expect(page).toHaveURL("/");
    await expectHandedOver(page);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });
});

test.describe("logo intro with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("never plays, and the logo simply goes home", async ({ page }) => {
    await page.goto("/products", { waitUntil: "commit" });
    await expect(html(page)).not.toHaveAttribute("data-intro", /.*/);

    await logoLink(page).click();

    await expect(page).toHaveURL("/");
    await expect(html(page)).not.toHaveAttribute("data-intro", /.*/);
  });
});
