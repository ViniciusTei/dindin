import { test, expect } from "./fixtures";
import { login, logout } from "./helpers";

test("login e logout", async ({ page, seed }) => {
  await login(page, {
    username: seed.users.admin.username,
    password: seed.users.admin.password,
  });

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByLabel("Transações")).toBeVisible();

  await logout(page);
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
});
