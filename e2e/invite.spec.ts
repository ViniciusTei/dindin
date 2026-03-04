import { test, expect } from "./fixtures";
import { ensureMemberJoined, login } from "./helpers";

test("gerar convite e entrar no household", async ({ page, browser, seed }) => {
  await login(page, {
    username: seed.users.admin.username,
    password: seed.users.admin.password,
  });

  const memberContext = await browser.newContext();
  const memberPage = await memberContext.newPage();

  await ensureMemberJoined(seed, { adminPage: page, memberPage });

  await expect(memberPage.getByLabel("Transações")).toBeVisible();
  await memberContext.close();
});
