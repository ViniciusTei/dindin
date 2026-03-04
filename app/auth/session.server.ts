import crypto from "node:crypto";
import { createCookie, redirect } from "react-router";

import { eq } from "drizzle-orm";

import { db } from "~/db/db.server";
import { env } from "~/lib/env.server";
import { sessions } from "~/db/schema";

const sessionCookie = createCookie("session", {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  secure: env.COOKIE_SECURE,
  secrets: [env.SESSION_SECRET],
  maxAge: 60 * 60 * 24 * 30,
});

function createId(): string {
  return crypto.randomUUID();
}

export async function createUserSession(params: {
  userId: string;
  redirectTo: string;
}): Promise<Response> {
  const sessionId = createId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);

  await db.insert(sessions).values({
    id: sessionId,
    userId: params.userId,
    expiresAt,
  });

  return redirect(params.redirectTo, {
    headers: {
      "Set-Cookie": await sessionCookie.serialize(sessionId),
    },
  });
}

export async function getUserId(request: Request): Promise<string | null> {
  const cookieHeader = request.headers.get("Cookie");
  const sessionId = await sessionCookie.parse(cookieHeader);
  if (!sessionId || typeof sessionId !== "string") return null;

  const now = new Date();
  const row = await db.query.sessions.findFirst({
    where: (table, { and, eq, gt }) =>
      and(eq(table.id, sessionId), gt(table.expiresAt, now)),
  });

  return row?.userId ?? null;
}

export async function requireUserId(request: Request): Promise<string> {
  const userId = await getUserId(request);
  if (!userId) throw redirect("/login");
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return null;
  return db.query.users.findFirst({ where: (t, { eq }) => eq(t.id, userId) });
}

export async function requireUser(request: Request) {
  const user = await getUser(request);
  if (!user) throw redirect("/login");
  return user;
}

export async function logout(request: Request): Promise<Response> {
  const cookieHeader = request.headers.get("Cookie");
  const sessionId = await sessionCookie.parse(cookieHeader);
  if (sessionId && typeof sessionId === "string") {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  return redirect("/login", {
    headers: {
      "Set-Cookie": await sessionCookie.serialize("", { maxAge: 0 }),
    },
  });
}

export async function requireAdmin(request: Request) {
  const user = await requireUser(request);
  if (!user.isAdmin) throw redirect("/");
  return user;
}
