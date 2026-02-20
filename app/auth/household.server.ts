import crypto from "node:crypto";

import { and, eq } from "drizzle-orm";

import { db } from "~/db/db.server";
import { categories, households, memberships } from "~/db/schema";

function createId(): string {
  return crypto.randomUUID();
}

const DEFAULT_CATEGORIES = [
  "Aluguel",
  "Luz",
  "Água",
  "Internet",
  "Cartão",
  "Mercado",
  "Outros",
];

export async function getHouseholdForUser(userId: string) {
  const membership = await db.query.memberships.findFirst({
    where: (t, { eq }) => eq(t.userId, userId),
  });
  if (!membership) return null;

  const household = await db.query.households.findFirst({
    where: (t, { eq }) => eq(t.id, membership.householdId),
  });
  if (!household) return null;

  return {
    household,
    role: membership.role,
  };
}

export async function createHouseholdWithAdmin(params: {
  adminUserId: string;
  name?: string;
}) {
  const householdId = createId();
  await db.insert(households).values({
    id: householdId,
    name: params.name ?? "Casa",
  });

  await db.insert(memberships).values({
    householdId,
    userId: params.adminUserId,
    role: "admin",
  });

  for (const name of DEFAULT_CATEGORIES) {
    await db.insert(categories).values({
      id: createId(),
      householdId,
      name,
    });
  }

  return { householdId };
}

export async function requireHouseholdId(userId: string): Promise<string> {
  const membership = await db.query.memberships.findFirst({
    where: (t, { eq }) => eq(t.userId, userId),
  });
  if (!membership) throw new Response("Sem household", { status: 403 });
  return membership.householdId;
}

export async function isUserMemberOfHousehold(params: {
  userId: string;
  householdId: string;
}): Promise<boolean> {
  const membership = await db.query.memberships.findFirst({
    where: (t, { and, eq }) =>
      and(eq(t.userId, params.userId), eq(t.householdId, params.householdId)),
  });
  return Boolean(membership);
}
