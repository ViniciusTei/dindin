import { expect, test } from "./fixtures";
import { login } from "./helpers";

test("criar household, adicionar membro por username e configurar rateio", async ({
  page,
  browser,
  seed,
}) => {
  await login(page, {
    username: seed.users.admin.username,
    password: seed.users.admin.password,
  });

  await page.goto("/households");
  await page.getByRole("button", { name: "Criar household" }).click();
  await page.getByLabel("Nome").fill("Casa Nova E2E");
  await Promise.all([
    page.waitForURL(/\/households\/.*\/manage/),
    page.getByTestId("household-create-button").click(),
  ]);

  await page.getByLabel("Username").fill(seed.users.member.username);
  await page.getByLabel("Papel").selectOption("member");
  await page.getByRole("button", { name: "Adicionar por username" }).click();
  await expect(page.getByRole("status")).toContainText("Membro adicionado");

  await page.locator(`input[name="share:${seed.users.admin.id}"]`).fill("70");
  await page.locator(`input[name="share:${seed.users.member.id}"]`).fill("");
  await page.getByRole("button", { name: "Salvar rateio" }).click();
  await expect(
    page.locator("tr", { hasText: seed.users.member.username }).getByText("30,00%"),
  ).toBeVisible();

  await page.goto("/households");
  const createdHousehold = page.locator("article", { hasText: "Casa Nova E2E" });
  await expect(createdHousehold).toBeVisible();
  await expect(createdHousehold).toContainText("2 membro(s)");

  const memberContext = await browser.newContext();
  const memberPage = await memberContext.newPage();

  await login(memberPage, {
    username: seed.users.member.username,
    password: seed.users.member.password,
  });
  await memberPage.goto("/households");

  const memberHousehold = memberPage.locator("article", { hasText: "Casa Nova E2E" });
  await expect(memberHousehold).toBeVisible();
  await expect(memberHousehold).toContainText("30,00%");

  await memberContext.close();
});
