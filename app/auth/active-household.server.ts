import { createCookie } from "react-router";

import { env } from "~/lib/env.server";
import type { MembershipRole } from "~/domain/households/entity";

const activeHouseholdCookie = createCookie("active_household", {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  secure: env.COOKIE_SECURE,
  secrets: [env.SESSION_SECRET],
  maxAge: 60 * 60 * 24 * 30,
});

export async function getStoredActiveHouseholdId(
  request: Request,
): Promise<string | null> {
  const cookieHeader = request.headers.get("Cookie");
  const householdId = await activeHouseholdCookie.parse(cookieHeader);
  return typeof householdId === "string" && householdId.trim()
    ? householdId
    : null;
}

export async function serializeActiveHouseholdId(
  householdId: string,
): Promise<string> {
  return activeHouseholdCookie.serialize(householdId);
}

export async function clearStoredActiveHouseholdId(): Promise<string> {
  return activeHouseholdCookie.serialize("", { maxAge: 0 });
}

export function resolveHouseholdSwitchRedirect(params: {
  currentPath: string;
  householdId: string;
  role: MembershipRole;
}): string {
  const rawPath = params.currentPath.trim();
  const safePath =
    rawPath.startsWith("/") && !rawPath.startsWith("//") ? rawPath : "/";
  const url = new URL(safePath, "https://financeiro.local");
  const match = url.pathname.match(/^\/households\/[^/]+(\/[^?]*)?$/);

  if (!match) {
    return `${url.pathname}${url.search}`;
  }

  const suffix = match[1] ?? "";
  if (
    (suffix === "/manage" || suffix === "/invite") &&
    params.role !== "admin"
  ) {
    return `/households/${params.householdId}${url.search}`;
  }

  return url.pathname.replace(
    /^\/households\/[^/]+/,
    `/households/${params.householdId}`,
  ) + url.search;
}
