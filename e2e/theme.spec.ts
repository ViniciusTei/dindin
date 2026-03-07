import { test, expect } from "./fixtures";
import { login } from "./helpers";

test("tema: alterna data-theme e persiste após reload", async ({ page, seed }) => {
  await login(page, {
    username: seed.users.admin.username,
    password: seed.users.admin.password,
  });

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  const before = await page.locator("html").getAttribute("data-theme");
  expect(before === "nord" || before === "sunset").toBeTruthy();

  const expectedAfter = before === "sunset" ? "nord" : "sunset";

  await page.getByRole("button", { name: /Ativar tema (claro|escuro)/ }).click();

  await expect(page.locator("html")).toHaveAttribute("data-theme", expectedAfter);

  const stored = await page.evaluate(() => window.localStorage.getItem("financeiro.theme"));
  expect(stored).toBe(expectedAfter);

  await page.reload();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", expectedAfter);
});
