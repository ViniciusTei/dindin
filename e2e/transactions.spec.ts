import { test, expect } from "./fixtures";
import { login } from "./helpers";

async function ensureAccount(page: any) {
  await page.goto("/accounts");
  await expect(page.getByRole("heading", { name: "Contas" })).toBeVisible();

  // Se já existe, não faz nada.
  if ((await page.getByDisplayValue("Carteira").count()) > 0) return;

  await page.getByLabel("Nome").fill("Carteira");
  await page.getByLabel("Saldo inicial").fill("0,00");
  await page.getByRole("button", { name: "Criar" }).click();
  await expect(page.getByRole("status")).toHaveText(/Salvo\./);
  await expect(page.getByDisplayValue("Carteira")).toBeVisible();
}

test("transações: validar erro, criar, editar e excluir", async ({ page, seed }) => {
  await login(page, {
    username: seed.users.admin.username,
    password: seed.users.admin.password,
  });

  await ensureAccount(page);

  await page.goto("/transactions");
  await expect(page.getByRole("heading", { name: "Transações" })).toBeVisible();

  // Erro: conta obrigatória (deixa no default "Selecione…")
  await page.locator("#amount").fill("12,34");
  await page.locator("#description").fill("Mercado");
  await page.getByRole("button", { name: "Criar" }).click();
  await expect(page.getByRole("alert")).toHaveText(/Conta é obrigatória\./);

  // Criar (seleciona conta)
  await page.locator("#accountId").selectOption({ label: "Carteira" });
  await page.getByRole("button", { name: "Criar" }).click();

  await expect(page.getByRole("status")).toHaveText(/Salvo\./);

  // Localiza card (após criar, existe 1 item) por presença do hidden transactionId
  const txCard = page
    .locator("div.rounded-box", { has: page.locator("input[name='transactionId']") })
    .first();

  await expect(txCard.locator("input[name='description']")).toHaveValue("Mercado");

  // Editar descrição e valor
  await txCard.locator("input[name='description']").fill("Mercado 2");
  await txCard.locator("input[name='amount']").fill("20,00");
  await txCard.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByRole("status")).toHaveText(/Salvo\./);
  await expect(txCard.locator("input[name='description']")).toHaveValue("Mercado 2");

  // Excluir (confirm)
  page.once("dialog", (d) => d.accept());
  await txCard.getByRole("button", { name: "Excluir" }).click();

  await expect(page.getByRole("status")).toHaveText(/Salvo\./);
  await expect(txCard).toHaveCount(0);
});
