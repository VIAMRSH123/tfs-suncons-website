import { expect, test } from "@playwright/test";

// Crawl from the home page, follow every same-site <a href> breadth-first, and
// fail on any non-200. Handover §4 recorded 25 unique links, 0 broken; the
// redesign trimmed that to 24, so rather than pin a count the test asserts the
// crawl reaches every URL in the sitemap (no orphan pages) — derived, not copied.

function normalise(href: string, from: string): string | null {
  const url = new URL(href, `http://localhost${from}`);
  if (url.origin !== "http://localhost") return null; // external, mailto:, tel:
  return url.pathname.length > 1 ? url.pathname.replace(/\/$/, "") : "/";
}

test("every internal link reachable from / resolves with 200", async ({
  page,
  request,
}) => {
  const seen = new Set<string>(["/"]);
  const queue = ["/"];
  const broken: string[] = [];

  while (queue.length > 0) {
    const path = queue.shift() as string;
    const response = await request.get(path, { maxRedirects: 0 });
    if (response.status() !== 200) {
      broken.push(`${path} -> ${response.status()}`);
      continue;
    }
    // Only HTML pages have links to follow (e.g. /catalogue.pdf does not).
    if (!(response.headers()["content-type"] ?? "").includes("text/html")) {
      continue;
    }

    await page.goto(path);
    const hrefs = await page
      .locator("a[href]")
      .evaluateAll((anchors) =>
        anchors.map((a) => a.getAttribute("href") ?? ""),
      );
    for (const href of hrefs) {
      const next = normalise(href, path);
      if (next && !seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }

  expect(broken, "broken internal links").toEqual([]);

  const sitemap = await (await request.get("/sitemap.xml")).text();
  const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (m) => new URL(m[1]).pathname.replace(/\/$/, "") || "/",
  );
  expect(listed.length, "sitemap entries").toBeGreaterThan(0);
  expect(
    listed.filter((path) => !seen.has(path)),
    "sitemap pages not linked from anywhere",
  ).toEqual([]);
});
