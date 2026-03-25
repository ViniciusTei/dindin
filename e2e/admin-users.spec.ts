import { test, expect } from "./fixtures";
import { login } from "./helpers";

test("convite permite criar conta já vinculada à household", async ({ page, browser, seed }) => {
  await login(page, {
    username: seed.users.admin.username,
    password: seed.users.admin.password,
  });

  await page.goto(`/households/${seed.householdId}/invite`);
  await page.getByRole("button", { name: "Gerar link (24h)" }).click();

  const linkLocator = page.getByRole("link", { name: /\/join\// });
  const href = await linkLocator.getAttribute("href");
  if (!href) throw new Error("Link de convite não encontrado");

  const invitedContext = await browser.newContext();
  const invitedPage = await invitedContext.newPage();

  const username = `e2e_${seed.runId}_w${seed.workerIndex}_invited_${Date.now()}`;
  await invitedPage.goto(href);
  await expect(invitedPage.getByRole("heading", { name: "Entrar por convite" })).toBeVisible();

  await invitedPage.getByLabel("Usuário").fill(username);
  await invitedPage.getByLabel("Senha").fill("password123");
  await invitedPage.getByRole("button", { name: "Criar conta e entrar" }).click();

  await invitedPage.waitForURL(`**/households/${seed.householdId}`);
  await expect(invitedPage.getByLabel("Transações")).toBeVisible();

  const rows = await seed.pool.query(
    `select u.username, m.household_id
       from users u
       inner join memberships m on m.user_id = u.id
      where u.username = $1`,
    [username]
  );

  expect(rows.rowCount).toBe(1);
  expect(rows.rows[0]?.household_id).toBe(seed.householdId);

  await invitedContext.close();
});
