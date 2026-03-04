import { test, expect } from "./fixtures";
import { login } from "./helpers";

test("contas: criar, validar erro, renomear e excluir", async ({ page, seed }) => {
  await login(page, {
    username: seed.users.admin.username,
    password: seed.users.admin.password,
  });

  await page.goto("/accounts");
  await expect(page.getByRole("heading", { name: "Contas" })).toBeVisible();

  // Erro: nome obrigatório
  await page.getByRole("button", { name: "Criar" }).click();
  await expect(page.getByRole("alert")).toHaveText(/Nome é obrigatório\./);

  // Criar conta
  await page.getByLabel("Nome").fill("Carteira");
  await page.getByLabel("Saldo inicial").fill("10,00");
  await page.getByRole("button", { name: "Criar" }).click();

  await expect(page.getByRole("status")).toHaveText(/Salvo\./);
  const row = page.locator("tbody tr").first();
  await expect(row.locator("input[name='name']")).toHaveValue("Carteira");

  // Renomear
  await row.locator("input[name='name']").fill("Carteira 2");
  await row.getByRole("button", { name: "Renomear" }).click();

  await expect(page.getByRole("status")).toHaveText(/Salvo\./);
  await expect(row.locator("input[name='name']")).toHaveValue("Carteira 2");

  // Excluir (confirm)
  page.once("dialog", (d) => d.accept());
  await row.getByRole("button", { name: "Excluir" }).click();

  await expect(page.getByRole("status")).toHaveText(/Salvo\./);
  await expect(row).toHaveCount(0);
});
