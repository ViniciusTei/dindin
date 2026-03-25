import type { Route } from "./+types/households.active";

import {
  resolveHouseholdSwitchRedirect,
  serializeActiveHouseholdId,
} from "~/auth/active-household.server";
import { requireHouseholdAccess } from "~/auth/household.server";
import { requireUserId } from "~/auth/session.server";

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const form = await request.formData();
  const householdId = String(form.get("householdId") ?? "").trim();
  const currentPath = String(form.get("currentPath") ?? "/");

  if (!householdId) {
    return new Response(
      JSON.stringify({ ok: false, error: "Household inválida." }),
      {
        status: 400,
        headers: {
          "Cache-Control": "private, no-store",
          "Content-Type": "application/json; charset=utf-8",
        },
      },
    );
  }

  const access = await requireHouseholdAccess({ userId, householdId });
  const redirectTo = resolveHouseholdSwitchRedirect({
    currentPath,
    householdId: access.householdId,
    role: access.role,
  });

  return new Response(
    JSON.stringify({
      ok: true,
      householdId: access.householdId,
      redirectTo,
    }),
    {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Type": "application/json; charset=utf-8",
        "Set-Cookie": await serializeActiveHouseholdId(access.householdId),
      },
    },
  );
}

export default function ActiveHouseholdActionRoute() {
  return null;
}
