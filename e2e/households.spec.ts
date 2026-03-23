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

  await page.getByTestId("household-add-member-open").click();
  const addMemberDialog = page.getByRole("dialog", { name: "Adicionar membro" });
  await addMemberDialog.getByLabel("Username").fill(seed.users.member.username);
  await addMemberDialog.getByLabel("Papel").selectOption("member");
  await addMemberDialog.getByTestId("household-add-member-submit").click();
  await expect(page.getByRole("status")).toContainText("Membro adicionado");

  await page.getByTestId("household-shares-open").click();
  const sharesDialog = page.getByRole("dialog", {
    name: "Configurar rateio de pagamentos",
  });
  await sharesDialog.locator(`input[name="share:${seed.users.admin.id}"]`).fill("70");
  await sharesDialog.locator(`input[name="share:${seed.users.member.id}"]`).fill("");
  await sharesDialog.getByTestId("household-shares-submit").click();
  const sharesSection = page.locator("section.card", {
    has: page.getByTestId("household-shares-open"),
  });
  await expect(
    sharesSection
      .locator("table")
      .last()
      .locator("tr", { hasText: seed.users.member.username })
      .getByText("30,00%"),
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
