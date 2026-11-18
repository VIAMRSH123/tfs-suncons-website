import { expect, test } from "@playwright/test";

// No horizontal scrolling at any of the widths the project's web testing rules
// require (handover §4 verified these by hand, once). Asserted as
// scrollWidth <= clientWidth on <html>. Every page in the sitemap is checked,
// so a new route is covered without editing this file.

const WIDTHS = [320, 375, 768, 1024, 1280, 1920];

test("no page scrolls horizontally at any required width", async ({
  page,
  request,
}) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (m) => new URL(m[1]).pathname,
  );
  expect(paths.length, "sitemap entries").toBeGreaterThan(0);

  const overflowing: string[] = [];
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of paths) {
      await page.goto(path, { waitUntil: "load" });
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      if (scrollWidth > clientWidth) {
        overflowing.push(`${path} @ ${width}px: ${scrollWidth} > ${clientWidth}`);
      }
    }
  }

  expect(overflowing, "pages wider than the viewport").toEqual([]);
});
