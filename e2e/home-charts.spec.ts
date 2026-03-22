import type { Page } from "@playwright/test";

import { test, expect } from "./fixtures";
import { login } from "./helpers";

async function ensureAccount(page: Page) {
  await page.goto("/accounts");
  await expect(page.getByRole("heading", { name: "Contas" })).toBeVisible();

  if ((await page.getByTestId("account-name-Carteira").count()) > 0) return;

  await page.getByTestId("account-name-input").fill("Carteira");
  await page.getByTestId("account-initialBalance-input").fill("0,00");
  await page.getByTestId("account-create-button").click();
  await expect(page.getByRole("status")).toHaveText(/Salvo\./);
  await expect(page.getByTestId("account-name-Carteira")).toBeVisible();
}

async function ensureCreditCard(page: Page) {
  await page.goto("/cards");
  await expect(page.getByRole("heading", { name: "Cartões" })).toBeVisible();

  if ((await page.getByRole("link", { name: "Abrir" }).count()) > 0) return;

  await page.locator("#number").fill("4111 1111 1111 1111");
  await page.locator("#expiration").fill("12/30");
  await page.locator("#closingDay").fill("10");
  await page.locator("#dueDay").fill("15");
  await page.getByRole("button", { name: "Cadastrar" }).click();
  await expect(page.getByRole("status")).toHaveText(/Salvo\./);
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
  await page.locator("#description").fill("Streaming");
  await page.locator("#categoryId").selectOption({ label: "Mercado" });
  await page.locator("#amount").fill("90,00");
  await page.locator("#occurredAt").fill("2026-03-20");
  await page.locator("#installmentsTotal").fill("3");
  await page.getByRole("button", { name: "Adicionar" }).click();
  await expect(page.getByRole("status")).toHaveText(/Salvo\./);

  await page.goto("/transactions");
  await expect(page.getByRole("heading", { name: "Transações" })).toBeVisible();

  await page.locator("#accountId").selectOption({ label: "Carteira" });
  await page.locator("#type").selectOption("expense");
  await page.locator("#amount").fill("120,00");
  await page.locator("#description").fill("Mercado");
  await page.getByRole("button", { name: "Criar" }).click();
  await expect(page.getByRole("status")).toHaveText(/Salvo\./);

  await page.locator("#accountId").selectOption({ label: "Carteira" });
  await page.locator("#type").selectOption("income");
  await page.locator("#amount").fill("300,00");
  await page.locator("#description").fill("Salário");
  await page.getByRole("button", { name: "Criar" }).click();
  await expect(page.getByRole("status")).toHaveText(/Salvo\./);

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.locator(".ReactChart")).toHaveCount(1);
  await expect(page.getByTestId("expense-pie-chart")).toBeVisible();
  await expect(page.getByText("Sem dados suficientes para gerar o gráfico.")).toHaveCount(0);
  await expect(page.getByText("Mercado")).toBeVisible();
  await expect(page.getByText("-R$ 150,00")).toHaveCount(3);

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
  await page.locator("#description").fill("Parcela futura");
  await page.locator("#categoryId").selectOption({ label: "Mercado" });
  await page.locator("#amount").fill("90,00");
  await page.locator("#occurredAt").fill("2026-03-20");
  await page.locator("#installmentsTotal").fill("3");
  await page.getByRole("button", { name: "Adicionar" }).click();
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
