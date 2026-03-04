import { test, expect } from "./fixtures";
import { createMonthViaUi, ensureMemberJoined, login } from "./helpers";

test("criar mês, adicionar despesa e fechar com transferência sugerida", async ({ page, browser, seed }) => {
  await login(page, {
    username: seed.users.admin.username,
    password: seed.users.admin.password,
  });

  const year = "2026";
  const month = String(((seed.workerIndex % 12) + 1)).padStart(2, "0");

  await createMonthViaUi(page, { year, month });
  await expect(page.getByRole("heading", { name: new RegExp(`Mês ${year}-${month}`) })).toBeVisible();
  const monthUrl = page.url();

  // Entra o segundo usuário via convite (precisa de 2 membros para sugerir transferência)
  const memberContext = await browser.newContext();
  const memberPage = await memberContext.newPage();
  await ensureMemberJoined(seed, { adminPage: page, memberPage });
  await memberContext.close();

  await page.goto(monthUrl);

  // Adiciona despesa
  await page.getByLabel("Descrição").fill("Mercado");
  await page.locator("select#categoryId").selectOption({ label: seed.categoryName });
  await page.getByLabel("Valor").fill("10,00");
  await page.getByRole("button", { name: "Adicionar" }).click();

  await expect(page.getByRole("cell", { name: "Mercado" })).toBeVisible();

  // Fecha mês -> gera transferências
  await page.getByRole("button", { name: "Fechar mês" }).click();
  await expect(page.getByText("closed")).toBeVisible();

  // Deve haver pelo menos uma transferência sugerida
  await expect(page.getByText("Transferências (sugeridas)")).toBeVisible();
  await expect(page.getByText("concluída")).toBeVisible();
});
