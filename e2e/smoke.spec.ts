import { expect, test } from "@playwright/test";

test("home page renders from the production build", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1").first()).toBeVisible();
});
