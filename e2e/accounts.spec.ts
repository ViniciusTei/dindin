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
  await page.getByRole("button", { name: "Criar conta" }).click();
  const createDialog = page.getByRole("dialog", { name: "Criar conta" });
  await createDialog.getByRole("button", { name: "Criar" }).click();
  await expect(page.locator("[role='alert']").last()).toHaveText(/Nome é obrigatório\./);

  // Criar conta
  await page.getByRole("button", { name: "Criar conta" }).click();
  await createDialog.getByLabel("Nome").fill("Carteira");
  await createDialog.getByLabel("Saldo inicial").fill("10,00");
  await createDialog.getByRole("button", { name: "Criar" }).click();

  await expect(page.getByRole("status")).toHaveText(/Salvo\./);
  const row = page.locator("tbody tr").first();
  await expect(row).toContainText("Carteira");

  // Renomear
  await row.getByRole("button", { name: "Renomear" }).click();
  const renameDialog = page.getByRole("dialog", { name: "Renomear conta" });
  await renameDialog.getByLabel("Nome").fill("Carteira 2");
  await renameDialog.getByRole("button", { name: "Salvar nome" }).click();

  await expect(page.getByRole("status")).toHaveText(/Salvo\./);
  await expect(row).toContainText("Carteira 2");

  // Excluir
  await row.getByRole("button", { name: "Excluir" }).click();
  const deleteDialog = page.getByRole("dialog", { name: "Excluir conta" });
  await deleteDialog.getByRole("button", { name: "Excluir conta" }).click();

  await expect(page.getByRole("status")).toHaveText(/Salvo\./);
  await expect(row).toHaveCount(0);
});
