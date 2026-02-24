import { test, expect } from "./fixtures";
import { login } from "./helpers";

test("admin cria novo usuário", async ({ page, seed }) => {
  await login(page, {
    username: seed.users.admin.username,
    password: seed.users.admin.password,
  });

  await page.goto("/admin/users");
  await expect(page.getByRole("heading", { name: "Usuários" })).toBeVisible();

  const username = `e2e_${seed.runId}_w${seed.workerIndex}_extra_${Date.now()}`;
  await page.getByRole("textbox", { name: "Usuário" }).fill(username);
  await page.locator("#password").fill("password123");
  await page.getByRole("button", { name: "Criar" }).click();

  await expect(page.getByRole("status")).toContainText("Usuário criado");
});
