import { expect, test } from "@playwright/test";

test("dashboard shell loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Welcome back")).toBeVisible();
  await expect(page.getByText("Mobile Number")).toBeVisible();
});

test("module coverage is discoverable from the workspace screen", async ({ page }) => {
  await page.goto("/modules");
  await expect(page.getByText("Bills")).toBeVisible();
  await expect(page.getByText("Documents")).toBeVisible();
});
