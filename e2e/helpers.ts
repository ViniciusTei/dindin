import type { Page } from "@playwright/test";

import type { SeedData } from "./db";

export async function login(page: Page, params: { username: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel("Usuário").fill(params.username);
  await page.getByLabel("Senha").fill(params.password);
  await Promise.all([
    page.waitForURL("**/"),
    page.getByRole("button", { name: "Entrar" }).click(),
  ]);
}

export async function logout(page: Page) {
  await Promise.all([
    page.waitForURL("**/login"),
    page.getByRole("button", { name: "Sair" }).click(),
  ]);
}

export async function ensureMemberJoined(seed: SeedData, params: { adminPage: Page; memberPage: Page }) {
  const existing = await seed.pool.query(
    "select 1 from memberships where household_id = $1 and user_id = $2 limit 1",
    [seed.householdId, seed.users.member.id]
  );
  if (existing.rowCount && existing.rowCount > 0) return;

  // Admin gera link
  await params.adminPage.goto(`/households/${seed.householdId}/invite`);
  await params.adminPage.getByRole("button", { name: "Gerar link (24h)" }).click();

  const linkLocator = params.adminPage.getByRole("link", { name: /\/join\// });
  const href = await linkLocator.getAttribute("href");
  if (!href) throw new Error("Link de convite não encontrado");

  // Member aceita o convite
  await login(params.memberPage, {
    username: seed.users.member.username,
    password: seed.users.member.password,
  });
  await params.memberPage.goto(href);
  await params.memberPage.waitForURL(/\/households\/.+/);
}
