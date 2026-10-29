import { expect, test } from "@playwright/test";

import nextConfig from "../next.config";

// Read the table from the real config so the test can't drift from a second copy.
test("next.config.ts defines the legacy redirects", async () => {
  const redirects = await nextConfig.redirects?.();
  expect(redirects?.length).toBeGreaterThan(0);
});

test.describe("legacy WordPress URLs", () => {
  test("every redirect is a permanent 308 to a page that resolves", async ({
    request,
  }) => {
    const redirects = (await nextConfig.redirects?.()) ?? [];

    for (const { source, destination } of redirects) {
      const hop = await request.get(source, { maxRedirects: 0 });
      expect(hop.status(), `${source} status`).toBe(308);
      expect(
        new URL(hop.headers()["location"], "http://localhost").pathname,
        `${source} target`,
      ).toBe(destination);

      const landed = await request.get(destination, { maxRedirects: 0 });
      expect(landed.status(), `${destination} (from ${source})`).toBe(200);
    }
  });
});
