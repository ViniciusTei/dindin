import type { Page } from "@playwright/test";

import { test, expect } from "./fixtures";
import { login } from "./helpers";

async function ensureAccount(page: Page) {
  await page.goto("/accounts");
  await expect(page.getByRole("heading", { name: "Contas" })).toBeVisible();

  if ((await page.getByTestId("account-name-Carteira").count()) > 0) return;

  await page.getByRole("button", { name: "Criar conta" }).click();
  const createDialog = page.getByRole("dialog", { name: "Criar conta" });
  await createDialog.getByTestId("account-name-input").fill("Carteira");
  await createDialog.getByTestId("account-initialBalance-input").fill("0,00");
  await createDialog.getByTestId("account-create-button").click();
  await expect(page.getByRole("status")).toHaveText(/Salvo\./);
  await expect(page.getByTestId("account-name-Carteira")).toBeVisible();
}

async function ensureCreditCard(page: Page) {
  await page.goto("/cards");
  await expect(page.getByRole("heading", { name: "Cartões" })).toBeVisible();

  if ((await page.getByRole("link", { name: "Abrir" }).count()) > 0) return;

  await page.getByRole("button", { name: "Cadastrar cartão" }).click();
  const createDialog = page.getByRole("dialog", { name: "Cadastrar cartão" });
  await createDialog.getByLabel("Número").fill("4111 1111 1111 1111");
  await createDialog.getByLabel("Validade (MM/AA)").fill("12/30");
  await createDialog.getByLabel("Dia de fechamento").fill("10");
  await createDialog.getByLabel("Dia de vencimento").fill("15");
  await createDialog.getByRole("button", { name: "Cadastrar" }).click();
  await expect(page.getByRole("link", { name: "Abrir" })).toBeVisible();
}

test("dashboard: gráficos renderizam sem NaN no console", async ({ page, seed }) => {
  const consoleMessages: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      consoleMessages.push(msg.text());
    }
  });

  await login(page, {
    username: seed.users.admin.username,
    password: seed.users.admin.password,
  });

  await ensureAccount(page);
  await ensureCreditCard(page);

  await page.goto("/cards");
  const cardLink = page.getByRole("link", { name: "Abrir" }).first();
  const cardHref = await cardLink.getAttribute("href");
  if (!cardHref) throw new Error("Link de cartão não encontrado");

  await page.goto(cardHref);
  await page.getByRole("button", { name: "Adicionar compra" }).click();
  let purchaseDialog = page.getByRole("dialog", { name: "Adicionar compra" });
  await purchaseDialog.getByLabel("Descrição").fill("Streaming");
  await purchaseDialog.getByLabel("Categoria").selectOption({ label: "Mercado" });
  await purchaseDialog.getByLabel("Valor").fill("90,00");
  await purchaseDialog.getByLabel("Data").fill("2026-03-20");
  await purchaseDialog.getByLabel("Parcelas").fill("3");
  await purchaseDialog.getByRole("button", { name: "Adicionar" }).click();
  await expect(page.getByRole("status")).toHaveText(/Salvo\./);

  await page.goto(`/households/${seed.householdId}/transactions`);
  await expect(page.getByRole("heading", { name: "Transações" })).toBeVisible();

  await page.getByTestId("transaction-create-open").click();
  let createTransactionDialog = page.getByRole("dialog", { name: "Criar transação" });
  await createTransactionDialog.getByLabel("Conta").selectOption({ label: "Carteira" });
  await createTransactionDialog.getByLabel("Tipo").selectOption("expense");
  await createTransactionDialog.getByLabel("Valor").fill("120,00");
  await createTransactionDialog.getByLabel("Descrição").fill("Mercado");
  await createTransactionDialog.getByRole("button", { name: "Criar" }).click();
  await expect(page.getByRole("status")).toHaveText(/Salvo\./);

  await page.getByTestId("transaction-create-open").click();
  createTransactionDialog = page.getByRole("dialog", { name: "Criar transação" });
  await createTransactionDialog.getByLabel("Conta").selectOption({ label: "Carteira" });
  await createTransactionDialog.getByLabel("Tipo").selectOption("income");
  await createTransactionDialog.getByLabel("Valor").fill("300,00");
  await createTransactionDialog.getByLabel("Descrição").fill("Salário");
  await createTransactionDialog.getByRole("button", { name: "Criar" }).click();
  await expect(page.getByRole("status")).toHaveText(/Salvo\./);

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.locator(".ReactChart")).toHaveCount(1);
  await expect(page.getByTestId("expense-pie-chart")).toBeVisible();
  await expect(page.getByText("Sem dados suficientes para gerar o gráfico.")).toHaveCount(0);
  await expect(page.getByText("Mercado")).toBeVisible();
  await expect(page.getByText("-R$ 150,00")).toHaveCount(3);

  await page.goto(`/households/${seed.householdId}`);
  const householdExpenseCard = page.locator("section.card", { hasText: "Despesas do mês" }).first();
  await expect(householdExpenseCard).toContainText(/0,00/);
  await expect(householdExpenseCard).not.toContainText(/150,00/);

  const nanMessages = consoleMessages.filter((message) => /NaN/i.test(message));
  expect(
    nanMessages,
    `Mensagens de console com NaN: ${nanMessages.join("\n")}`,
  ).toHaveLength(0);
});

test("dashboard: navega entre meses e mostra histórico e faturas futuras", async ({ page, seed }) => {
  await login(page, {
    username: seed.users.admin.username,
    password: seed.users.admin.password,
  });

  await ensureAccount(page);
  await ensureCreditCard(page);

  await page.goto("/cards");
  const cardLink = page.getByRole("link", { name: "Abrir" }).first();
  const cardHref = await cardLink.getAttribute("href");
  if (!cardHref) throw new Error("Link de cartão não encontrado");

  await page.goto(cardHref);
  await page.getByRole("button", { name: "Adicionar compra" }).click();
  const purchaseDialog = page.getByRole("dialog", { name: "Adicionar compra" });
  await purchaseDialog.getByLabel("Descrição").fill("Parcela futura");
  await purchaseDialog.getByLabel("Categoria").selectOption({ label: "Mercado" });
  await purchaseDialog.getByLabel("Valor").fill("90,00");
  await purchaseDialog.getByLabel("Data").fill("2026-03-20");
  await purchaseDialog.getByLabel("Parcelas").fill("3");
  await purchaseDialog.getByRole("button", { name: "Adicionar" }).click();
  await expect(page.getByRole("status")).toHaveText(/Salvo\./);

  await page.goto("/");
  await expect(page.getByText(/março/i)).toBeVisible();
  await expect(page.getByText("Mercado")).toBeVisible();
  await expect(page.getByText("-R$ 30,00").first()).toBeVisible();

  await page.getByRole("link", { name: "Próximo mês" }).click();
  await expect(page).toHaveURL(/month=2026-04/);
  await expect(page.getByText(/abril/i)).toBeVisible();
  await expect(page.getByText("Mercado")).toBeVisible();
  await expect(page.getByText("-R$ 30,00").first()).toBeVisible();

  await page.getByRole("link", { name: "Mês anterior" }).click();
  await expect(page).toHaveURL(/month=2026-03/);
  await expect(page.getByText(/março/i)).toBeVisible();

  await page.getByRole("link", { name: "Mês anterior" }).click();
  await expect(page).toHaveURL(/month=2026-02/);
  await expect(page.getByText(/fevereiro/i)).toBeVisible();
  await expect(page.getByText("Nenhuma despesa no mês.")).toBeVisible();
});
