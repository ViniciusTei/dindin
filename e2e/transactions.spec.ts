import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { login } from "./helpers";

async function ensureAccount(page: Page) {
  await page.goto("/accounts");
  await expect(page.getByRole("heading", { name: "Contas" })).toBeVisible();

  // Se já existe, não faz nada.
  if ((await page.getByTestId("account-name-Carteira").count()) > 0) return;

  await page.getByRole("button", { name: "Criar conta" }).click();
  const createDialog = page.getByRole("dialog", { name: "Criar conta" });
  await createDialog.getByTestId("account-name-input").fill("Carteira");
  await createDialog.getByTestId("account-initialBalance-input").fill("0,00");
  await createDialog.getByTestId("account-create-button").click();
  await expect(page.getByRole("status")).toHaveText(/Salvo\./);
  await expect(page.getByTestId("account-name-Carteira")).toBeVisible();
}

test("transações: validar erro, criar, editar e excluir", async ({ page, seed }) => {
  await login(page, {
    username: seed.users.admin.username,
    password: seed.users.admin.password,
  });

  await ensureAccount(page);

  await page.goto(`/households/${seed.householdId}/transactions`);
  await expect(page.getByRole("heading", { name: "Transações" })).toBeVisible();

  // Erro: conta obrigatória (deixa no default "Selecione…")
  await page.getByTestId("transaction-create-open").click();
  let createDialog = page.getByRole("dialog", { name: "Criar transação" });
  await createDialog.getByLabel("Valor").fill("12,34");
  await createDialog.getByLabel("Descrição").fill("Mercado");
  await createDialog.getByTestId("transaction-create-submit").click();
  await expect(page.locator("[role='alert']").last()).toHaveText(/Conta é obrigatória\./);

  // Criar (seleciona conta)
  await page.getByTestId("transaction-create-open").click();
  createDialog = page.getByRole("dialog", { name: "Criar transação" });
  await createDialog.getByLabel("Conta").selectOption({ label: "Carteira" });
  await createDialog.getByLabel("Descrição").fill("Mercado");
  await createDialog.getByLabel("Valor").fill("12,34");
  await createDialog.getByTestId("transaction-create-submit").click();

  await expect(page.getByRole("status")).toHaveText(/Salvo\./);

  const txCard = page.locator("[data-testid^='transaction-card-']").first();

  await expect(txCard).toContainText("Mercado");

  // Editar descrição e valor
  await txCard.getByRole("button", { name: "Editar" }).click();
  const editDialog = page.getByRole("dialog", { name: "Editar transação" });
  await editDialog.getByLabel("Descrição").fill("Mercado 2");
  await editDialog.getByLabel("Valor").fill("20,00");
  await editDialog.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByRole("status")).toHaveText(/Salvo\./);
  await expect(txCard).toContainText("Mercado 2");

  // Excluir
  await txCard.getByRole("button", { name: "Excluir" }).click();
  const deleteDialog = page.getByRole("dialog", { name: "Excluir transação" });
  await deleteDialog.getByRole("button", { name: "Excluir transação" }).click();

  await expect(page.getByRole("status")).toHaveText(/Salvo\./);
  await expect(txCard).toHaveCount(0);
});

test("transações: criar compra por cartão (household) com parcelas", async ({ page, seed }) => {
  await login(page, {
    username: seed.users.admin.username,
    password: seed.users.admin.password,
  });

  await ensureAccount(page);

  // Criar cartão
  await page.goto("/cards");
  await expect(page.getByRole("heading", { name: "Cartões" })).toBeVisible();
  await page.getByRole("button", { name: "Cadastrar cartão" }).click();
  const createCardDialog = page.getByRole("dialog", { name: "Cadastrar cartão" });
  await createCardDialog.locator("#card-create-number").fill("4111 1111 1111 1111");
  await createCardDialog.locator("#card-create-expiration").fill("03/26");
  await createCardDialog.locator("#card-create-cvv").fill("123");
  await createCardDialog.locator("#card-create-limit").fill("1000,00");
  await createCardDialog.locator("#card-create-account-id").selectOption({ label: "Carteira" });
  await createCardDialog.getByRole("button", { name: "Cadastrar" }).click();
  await expect(page.getByRole("status")).toHaveText(/Salvo\./);

  // Criar compra na household usando cartão parcelado
  await page.goto(`/households/${seed.householdId}/transactions`);
  await expect(page.getByRole("heading", { name: "Transações" })).toBeVisible();

  await page.getByTestId("transaction-create-open").click();
  const createDialog = page.getByRole("dialog", { name: "Criar transação" });
  await createDialog.getByLabel("Conta").selectOption({ label: "Carteira" });
  await createDialog.getByLabel("Descrição").fill("Compras PC");
  await createDialog.getByLabel("Valor").fill("100,00");
  // select first card (index 1, index 0 is the 'Não (usar conta)')
  await createDialog.locator('#transaction-create-creditCardId').selectOption({ index: 1 });
  await createDialog.getByLabel("Parcelas").fill("3");
  await createDialog.getByTestId("transaction-create-submit").click();

  await expect(page.getByRole("status")).toHaveText(/Salvo\./);

  // Verifica que 3 parcelas foram criadas (descrição base aparece em 3 headings)
  const headings = page.locator("h3", { hasText: "Compras PC" });
  await expect(headings).toHaveCount(3);
});
